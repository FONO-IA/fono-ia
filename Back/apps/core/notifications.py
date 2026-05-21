from django.conf import settings
from django.core.mail import send_mail


def imprimir_credenciais_acesso(*, nome, email, usuario, senha, perfil, email_status):
    print(
        f"""
========================================
CREDENCIAIS DE ACESSO - FONO IA
Perfil: {perfil}
Nome: {nome}
Email: {email}
Usuario: {usuario}
Senha: {senha}
Email enviado: {email_status}
========================================
"""
    )


def enviar_credenciais_acesso(*, nome, email, usuario, senha, perfil):
    subject = f"Bem-vindo(a) ao Fono IA - Dados de acesso ({perfil})"
    message = f"""
Ola, {nome}!

Seu cadastro como {perfil} foi realizado com sucesso no Fono IA.

Abaixo estao seus dados de acesso:

Usuario: {usuario}
Senha: {senha}

Acesse o sistema e faca login com essas informacoes.

Por seguranca, recomendamos alterar sua senha apos o primeiro acesso.

Atenciosamente,
Equipe Fono IA
"""

    email_enviado = False

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        email_enviado = True
    except Exception as exc:
        print(f"[FONO-IA] Erro ao enviar email de acesso para {email}: {exc}")

    imprimir_credenciais_acesso(
        nome=nome,
        email=email,
        usuario=usuario,
        senha=senha,
        perfil=perfil,
        email_status="sim" if email_enviado else "nao",
    )

    return email_enviado
