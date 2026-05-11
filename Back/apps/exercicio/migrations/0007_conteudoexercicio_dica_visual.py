from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("exercicio", "0006_backfill_conteudos_from_conteudo"),
    ]

    operations = [
        migrations.AddField(
            model_name="conteudoexercicio",
            name="dica_visual",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to="dicas_visuais/",
            ),
        ),
    ]
