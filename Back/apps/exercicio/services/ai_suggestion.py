import json
import re
import unicodedata
from urllib import request

from django.conf import settings


DEFAULT_MODEL = "llama-3.1-8b-instant"
VALID_LEVELS = {"Fácil", "Médio", "Difícil"}

WORD_BANK = {
    "frutas": {
        "Fácil": ["banana", "uva", "maçã", "mamão", "limão"],
        "Médio": ["laranja", "morango", "abacaxi", "melancia", "acerola"],
        "Difícil": ["maracujá", "jabuticaba", "framboesa", "mexerica", "pitanga"],
    },
    "animais": {
        "Fácil": ["gato", "cão", "pato", "vaca", "sapo"],
        "Médio": ["cavalo", "macaco", "coelho", "galinha", "ovelha"],
        "Difícil": ["jacaré", "tartaruga", "borboleta", "dinossauro", "rinoceronte"],
    },
    "cores": {
        "Fácil": ["azul", "rosa", "verde", "roxo", "preto"],
        "Médio": ["amarelo", "laranja", "vermelho", "branco", "marrom"],
        "Difícil": ["turquesa", "violeta", "dourado", "prateado", "colorido"],
    },
    "brinquedos": {
        "Fácil": ["bola", "dado", "pipa", "cubo", "pião"],
        "Médio": ["boneca", "carrinho", "massinha", "peteca", "quebra-cabeça"],
        "Difícil": ["patinete", "bicicleta", "fantoche", "escorregador", "trenzinho"],
    },
    "alimentos": {
        "Fácil": ["pão", "leite", "bolo", "arroz", "sopa"],
        "Médio": ["macarrão", "feijão", "queijo", "iogurte", "cenoura"],
        "Difícil": ["espaguete", "panqueca", "beterraba", "mandioca", "brócolis"],
    },
    "escola": {
        "Fácil": ["lápis", "cola", "livro", "mesa", "giz"],
        "Médio": ["caderno", "mochila", "tesoura", "borracha", "estojo"],
        "Difícil": ["apontador", "professora", "biblioteca", "atividade", "calendário"],
    },
    "familia": {
        "Fácil": ["mãe", "pai", "bebê", "vovó", "tio"],
        "Médio": ["irmão", "prima", "família", "vovô", "tia"],
        "Difícil": ["sobrinho", "madrinha", "padrinho", "bisavó", "responsável"],
    },
    "corpo": {
        "Fácil": ["mão", "pé", "boca", "olho", "nariz"],
        "Médio": ["cabeça", "joelho", "orelha", "barriga", "cotovelo"],
        "Difícil": ["sobrancelha", "tornozelo", "pescoço", "bochecha", "calcanhar"],
    },
    "transportes": {
        "Fácil": ["carro", "moto", "trem", "barco", "avião"],
        "Médio": ["ônibus", "bicicleta", "caminhão", "metrô", "trator"],
        "Difícil": ["helicóptero", "ambulância", "foguete", "escavadeira", "submarino"],
    },
}


def normalize_level(nivel):
    value = (nivel or "Fácil").strip()
    api_to_display = {
        "FAC": "Fácil",
        "MED": "Médio",
        "DIF": "Difícil",
    }

    value = api_to_display.get(value.upper(), value)
    return value if value in VALID_LEVELS else "Fácil"


def normalize_key(value):
    normalized = unicodedata.normalize("NFD", value or "")
    without_accents = "".join(
        char for char in normalized
        if unicodedata.category(char) != "Mn"
    )
    return re.sub(r"[^a-z0-9]+", " ", without_accents.lower()).strip()


def title_category(categoria):
    return re.sub(r"\s+", " ", categoria or "").strip().title()


def fallback_words(categoria, nivel):
    key = normalize_key(categoria)
    words_by_level = WORD_BANK.get(key)

    if not words_by_level and key.endswith("s"):
        words_by_level = WORD_BANK.get(key[:-1])

    if words_by_level:
        return words_by_level.get(nivel) or words_by_level["Fácil"]

    base = normalize_key(categoria).split(" ")[0] or "tema"
    return [
        base,
        f"{base} simples",
        f"{base} curto",
        f"{base} familiar",
        f"{base} conhecido",
    ]


def build_fallback_suggestion(categoria, nivel, objetivo=""):
    nivel = normalize_level(nivel)
    categoria_formatada = title_category(categoria)
    words = fallback_words(categoria, nivel)
    objetivo_texto = (
        objetivo.strip()
        if objetivo and objetivo.strip()
        else (
            "Trabalhar pronúncia, repetição e identificação de palavras "
            "relacionadas à categoria informada."
        )
    )
    words_text = "\n".join(f"- {word}" for word in words[:5])

    return (
        f"Sugestão de exercício: Exercício de pronúncia - {categoria_formatada}\n\n"
        f"Categoria: {categoria_formatada}\n\n"
        f"Nível sugerido: {nivel}\n\n"
        f"Objetivo:\n{objetivo_texto}\n\n"
        f"Palavras sugeridas:\n{words_text}\n\n"
        "Instruções:\n"
        "Oriente a criança a repetir cada palavra com calma. O profissional "
        "pode falar primeiro como modelo e depois pedir que a criança repita. "
        "Se houver dificuldade, divida a palavra em sílabas e retome devagar.\n\n"
        "Dica terapêutica:\n"
        "Observe os sons com maior dificuldade, reforce positivamente cada "
        "tentativa e adapte a lista conforme a evolução do paciente."
    )


def build_prompt(categoria, nivel, objetivo=""):
    return (
        "Você é um assistente de apoio fonoaudiológico. Gere uma sugestão "
        "textual de exercício infantil com base nas informações fornecidas. "
        "Não responda em JSON. Não diga que vai preencher campos. Apenas "
        "entregue uma sugestão organizada para o fonoaudiólogo usar como "
        "referência. A sugestão deve conter nome do exercício, categoria, "
        "nível sugerido, objetivo, palavras sugeridas, instruções e dica "
        "terapêutica. Gere exatamente 5 palavras relacionadas à categoria "
        "informada. Não gere mais nem menos que 5 palavras. As palavras devem "
        "ser adequadas para crianças e compatíveis com o nível escolhido. "
        "Evite termos ofensivos, impróprios, complexos demais ou fora do "
        "contexto. Para nível Fácil, use palavras curtas e comuns. Para nível "
        "Médio, use palavras com sílabas variadas. Para nível Difícil, use "
        "palavras maiores ou com fonemas mais desafiadores. Use linguagem "
        "clara, profissional e adequada para crianças. "
        f"Categoria: {categoria}. Nível: {nivel}. "
        f"Objetivo informado: {objetivo or 'não informado'}."
    )


def call_groq(prompt):
    api_key = getattr(settings, "GROQ_API_KEY", "")

    if not api_key:
        return ""

    payload = {
        "model": getattr(settings, "AI_MODEL", DEFAULT_MODEL) or DEFAULT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Você responde em português do Brasil, com texto seguro "
                    "e apropriado para crianças."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
        "max_tokens": 700,
    }
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        "https://api.groq.com/openai/v1/chat/completions",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with request.urlopen(req, timeout=15) as response:
        body = json.loads(response.read().decode("utf-8"))

    return (
        body.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
        .strip()
    )


def extract_suggested_words(text):
    lines = text.splitlines()
    collecting = False
    words = []

    for line in lines:
        normalized = normalize_key(line)

        if normalized.startswith("palavras sugeridas"):
            collecting = True
            continue

        if collecting and line.strip().startswith("-"):
            words.append(line.strip()[1:].strip())
            continue

        if collecting and words and line.strip():
            break

    return [word for word in words if word]


def ensure_exactly_five_words(text, categoria, nivel):
    words = extract_suggested_words(text)

    if len(words) == 5:
        return text

    fallback = build_fallback_suggestion(categoria, nivel)
    return fallback


def generate_ai_suggestion(categoria, nivel, objetivo=""):
    nivel = normalize_level(nivel)
    provider = (getattr(settings, "AI_PROVIDER", "groq") or "groq").lower()
    prompt = build_prompt(categoria, nivel, objetivo)

    try:
        if provider == "groq":
            suggestion = call_groq(prompt)
        else:
            suggestion = ""

        if not suggestion:
            return build_fallback_suggestion(categoria, nivel, objetivo)

        return ensure_exactly_five_words(suggestion, categoria, nivel)
    except Exception:
        return build_fallback_suggestion(categoria, nivel, objetivo)
