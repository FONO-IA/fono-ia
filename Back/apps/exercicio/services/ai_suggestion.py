import json
import logging
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings


logger = logging.getLogger(__name__)

LEVEL_LABELS = {
    "fac": "Fácil",
    "facil": "Fácil",
    "fácil": "Fácil",
    "med": "Médio",
    "medio": "Médio",
    "médio": "Médio",
    "dif": "Difícil",
    "dificil": "Difícil",
    "difícil": "Difícil",
}

CATEGORY_WORDS = {
    "frutas": ["banana", "uva", "maçã", "mamão", "limão"],
    "animais": ["gato", "pato", "sapo", "vaca", "cavalo"],
    "cores": ["azul", "verde", "rosa", "preto", "branco"],
    "brinquedos": ["bola", "boneca", "carrinho", "dado", "pião"],
    "alimentos": ["arroz", "feijão", "pão", "leite", "sopa"],
    "roupas": ["blusa", "calça", "meia", "sapato", "boné"],
    "corpo": ["boca", "mão", "pé", "nariz", "olho"],
    "casa": ["mesa", "porta", "cama", "janela", "sofá"],
    "escola": ["lápis", "livro", "cola", "mesa", "mochila"],
    "transportes": ["carro", "ônibus", "trem", "barco", "avião"],
}


class AISuggestionError(Exception):
    pass


def generate_exercise_suggestion(categoria, nivel="Médio", objetivo=""):
    categoria = (categoria or "").strip()

    if not categoria:
        raise ValueError("Categoria é obrigatória.")

    nivel = normalize_level(nivel)
    objetivo = (objetivo or "").strip()

    try:
        suggestion = _request_ai_suggestion(categoria, nivel, objetivo)
        text = _clean_suggestion_text(suggestion)

        if len(_extract_suggested_words(text)) != 5:
            raise AISuggestionError(
                "A IA não retornou exatamente 5 palavras sugeridas."
            )

        return {"sugestao": text}
    except Exception as exc:
        logger.warning("Falha ao gerar sugestão com IA: %s", exc)
        return {"sugestao": fallback_suggestion_text(categoria, nivel, objetivo)}


def fallback_suggestion_text(categoria, nivel="Médio", objetivo=""):
    categoria = (categoria or "").strip()
    nivel = normalize_level(nivel)
    categoria_display = categoria[:1].upper() + categoria[1:] if categoria else ""

    words = _fallback_words_for_category(categoria)

    if _normalize_text(categoria) == "frutas":
        objetivo_text = (
            objetivo
            or "Trabalhar a identificação, repetição e emissão correta de palavras simples relacionadas a frutas."
        )
        return (
            "Sugestão de exercício: Pronúncia com frutas\n\n"
            "Categoria: Frutas\n\n"
            f"Nível sugerido: {nivel}\n\n"
            "Objetivo:\n"
            f"{objetivo_text}\n\n"
            "Palavras sugeridas:\n"
            f"{_format_words(words)}\n\n"
            "Instruções:\n"
            "Peça para a criança repetir cada palavra devagar. Primeiro, o "
            "profissional fala a palavra como modelo. Depois, a criança "
            "repete. Caso haja dificuldade, divida a palavra em sílabas e "
            "repita novamente.\n\n"
            "Dica terapêutica:\n"
            "Comece com palavras curtas e familiares. Reforce positivamente "
            "cada tentativa correta e observe sons que apresentam maior "
            "dificuldade."
        )

    objetivo_text = (
        objetivo
        or "Trabalhar pronúncia, repetição e identificação de palavras relacionadas à categoria informada."
    )

    return (
        f"Sugestão de exercício: Exercício de pronúncia - {categoria_display}\n\n"
        f"Categoria: {categoria_display}\n\n"
        f"Nível sugerido: {nivel}\n\n"
        "Objetivo:\n"
        f"{objetivo_text}\n\n"
        "Palavras sugeridas:\n"
        f"{_format_words(words)}\n\n"
        "Instruções:\n"
        "Oriente a criança a repetir cada palavra com calma. O profissional "
        "pode falar primeiro como modelo e depois pedir que a criança repita.\n\n"
        "Dica terapêutica:\n"
        "Observe os sons com maior dificuldade e adapte a lista de palavras "
        "conforme a evolução do paciente."
    )


def normalize_level(nivel):
    raw_level = str(nivel or "").strip()
    key = _normalize_text(raw_level)

    return LEVEL_LABELS.get(raw_level.lower()) or LEVEL_LABELS.get(key) or "Médio"


def _request_ai_suggestion(categoria, nivel, objetivo):
    provider = getattr(settings, "AI_PROVIDER", "groq").lower()

    if provider != "groq":
        raise AISuggestionError(f"Provider de IA não suportado: {provider}")

    api_key = getattr(settings, "GROQ_API_KEY", "")
    if not api_key:
        raise AISuggestionError("GROQ_API_KEY não configurada.")

    prompt = _build_prompt(categoria, nivel, objetivo)
    payload = {
        "model": getattr(settings, "AI_MODEL", "llama-3.1-8b-instant"),
        "messages": [
            {
                "role": "system",
                "content": (
                    "Você é um assistente de apoio fonoaudiológico. "
                    "Entregue apenas uma sugestão textual organizada, sem JSON e sem markdown."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.35,
        "max_tokens": 800,
    }

    request = Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    timeout = getattr(settings, "AI_REQUEST_TIMEOUT", 20)

    try:
        with urlopen(request, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise AISuggestionError(str(exc)) from exc

    try:
        return data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise AISuggestionError("Resposta da IA em formato inesperado.") from exc


def _build_prompt(categoria, nivel, objetivo):
    return (
        "Você é um assistente de apoio fonoaudiológico. Gere uma sugestão "
        "textual de exercício infantil com base nas informações fornecidas. "
        "Não responda em JSON. Não diga que vai preencher campos. Apenas "
        "entregue uma sugestão organizada para o fonoaudiólogo usar como "
        "referência. A sugestão deve conter nome do exercício, categoria, "
        "nível sugerido, objetivo, palavras sugeridas, instruções e dica "
        "terapêutica. Use linguagem clara, profissional e adequada para "
        "crianças. Evite termos ofensivos, impróprios, adultos ou complexos. "
        "Gere exatamente 5 palavras relacionadas à categoria informada. "
        "Não gere mais nem menos que 5 palavras. As palavras devem ser "
        "adequadas para crianças e compatíveis com o nível escolhido. "
        "Na seção Palavras sugeridas, use exatamente este formato, com 5 "
        "linhas iniciadas por hífen: Palavras sugeridas:\n- palavra 1\n"
        "- palavra 2\n- palavra 3\n- palavra 4\n- palavra 5. "
        f"Categoria: {categoria}. Nível: {nivel}. "
        f"Objetivo informado: {objetivo or 'não informado'}."
    )


def _clean_suggestion_text(value):
    text = str(value or "").strip()

    if not text:
        raise AISuggestionError("A IA retornou sugestão vazia.")

    if text.startswith("```"):
        text = text.strip("`").strip()

    return text


def _fallback_words_for_category(categoria):
    key = _normalize_text(categoria)

    if key in CATEGORY_WORDS:
        return CATEGORY_WORDS[key]

    if "fruta" in key:
        return CATEGORY_WORDS["frutas"]
    if "animal" in key or "bicho" in key:
        return CATEGORY_WORDS["animais"]
    if "cor" in key or "cores" in key:
        return CATEGORY_WORDS["cores"]
    if "transporte" in key:
        return CATEGORY_WORDS["transportes"]
    if "r" in key and ("som" in key or "fonema" in key):
        return ["rato", "roda", "rede", "rua", "roupa"]
    if "s" in key and ("som" in key or "fonema" in key):
        return ["sapo", "sino", "sol", "selo", "sapato"]
    if "l" in key and ("som" in key or "fonema" in key):
        return ["lua", "lobo", "leite", "bola", "mala"]

    return ["casa", "bola", "pato", "mesa", "sapo"]


def _format_words(words):
    return "\n".join(f"- {word}" for word in words[:5])


def _extract_suggested_words(text):
    words = []
    in_words_section = False

    for line in text.splitlines():
        stripped = line.strip()

        if not stripped:
            if in_words_section and words:
                break
            continue

        normalized = _normalize_text(stripped).rstrip(":")

        if normalized.startswith("palavras sugeridas"):
            in_words_section = True
            continue

        if in_words_section and stripped.endswith(":"):
            break

        if in_words_section:
            if stripped.startswith("- "):
                words.append(stripped[2:].strip())
            elif stripped[:2].rstrip(".").isdigit():
                words.append(stripped[2:].strip(" ."))
            else:
                break

    return [word for word in words if word]


def _normalize_text(value):
    text = str(value or "").strip().lower()
    normalized = unicodedata.normalize("NFD", text)
    return "".join(
        char for char in normalized
        if unicodedata.category(char) != "Mn"
    )
