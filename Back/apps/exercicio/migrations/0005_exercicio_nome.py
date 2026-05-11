from django.db import migrations, models


def add_nome_column(apps, schema_editor):
    table_name = "exercicio_exercicio"
    existing_columns = {
        column.name
        for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(),
            table_name,
        )
    }

    if "nome" in existing_columns:
        return

    Exercicio = apps.get_model("exercicio", "Exercicio")
    field = models.CharField(
        blank=True,
        default="",
        max_length=255,
        verbose_name="Nome",
    )
    field.set_attributes_from_name("nome")
    schema_editor.add_field(Exercicio, field)


def remove_nome_column(apps, schema_editor):
    table_name = "exercicio_exercicio"
    existing_columns = {
        column.name
        for column in schema_editor.connection.introspection.get_table_description(
            schema_editor.connection.cursor(),
            table_name,
        )
    }

    if "nome" not in existing_columns:
        return

    Exercicio = apps.get_model("exercicio", "Exercicio")
    field = models.CharField(
        blank=True,
        default="",
        max_length=255,
        verbose_name="Nome",
    )
    field.set_attributes_from_name("nome")
    schema_editor.remove_field(Exercicio, field)


class Migration(migrations.Migration):

    dependencies = [
        ("exercicio", "0004_exercicio_concluido"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_nome_column, remove_nome_column),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="exercicio",
                    name="nome",
                    field=models.CharField(
                        blank=True,
                        default="",
                        max_length=255,
                        verbose_name="Nome",
                    ),
                ),
            ],
        ),
    ]
