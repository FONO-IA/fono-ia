import re

from django.db import migrations


def backfill_conteudos(apps, schema_editor):
    Exercicio = apps.get_model("exercicio", "Exercicio")
    ConteudoExercicio = apps.get_model("exercicio", "ConteudoExercicio")

    for exercicio in Exercicio.objects.all():
        if ConteudoExercicio.objects.filter(exercicio=exercicio).exists():
            continue

        palavras = [
            part.strip()
            for part in re.split(r"[,;\n\r]+", exercicio.conteudo or "")
            if part.strip()
        ]

        for palavra in palavras:
            ConteudoExercicio.objects.create(
                exercicio=exercicio,
                texto=palavra,
                instrucao=exercicio.instrucao or f"Pratique: {palavra}",
            )


class Migration(migrations.Migration):

    dependencies = [
        ("exercicio", "0005_exercicio_nome"),
    ]

    operations = [
        migrations.RunPython(backfill_conteudos, migrations.RunPython.noop),
    ]
