from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

from pages.login_page import LoginPage
from pages.home_page import HomePage


def test_home():
    options = Options()
    options.add_experimental_option("detach", True)

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)

    wait = WebDriverWait(driver, 10)

    driver.get("http://localhost:5173/")
    driver.maximize_window()

    login = LoginPage(driver)
    home = HomePage(driver)

    wait.until(EC.presence_of_element_located(("id", "email-pro")))

    # LOGIN
    time.sleep(1)
    login.preencher_email("")
    time.sleep(1)
    login.preencher_senha("")
    login.clicar_entrar()

    # espera redirecionar
    wait.until(EC.url_contains("/admin"))

    # abre tela de cadastro
    time.sleep(1)
    home.clicar_novoPaciente()

    # Cadastrar responsável
    time.sleep(1)
    home.preencher_nome_responsavel("Maria Silva")
    time.sleep(1)
    home.preencher_cpf("12345678910")
    time.sleep(1)
    home.preencher_telefone("83999999999")
    time.sleep(1)
    home.preencher_email("maria04@email.com")
    time.sleep(1)
    home.preencher_senha("12345678")
    time.sleep(1)
    home.preencher_confirmar_senha("12345678")

    # Cadastrar paciente
    time.sleep(1)
    home.preencher_nome_paciente("João Silva")
    time.sleep(1)
    home.preencher_data_nascimento("01012020")
    time.sleep(1)
    home.preencher_observacoes("Problema da fala")
    time.sleep(1)

    # Clicar cadastra
    home.clicar_cadastrar()

    # Espera modal aparecer
    wait.until(
        EC.visibility_of_element_located((("id"), "btn-encerrar"))
    )

    # Clicar em encerra
    home.clicar_encerrar()

    time.sleep(1)
    # abre card do paciente
    home.clicar_card_paciente()

    # cria exercício
    time.sleep(1)
    home.clicar_criar_exercicio()

    # preenche exercício
    time.sleep(1)
    home.preencher_nome_exercicio("Exercício de Pronúncia")
    time.sleep(1)
    home.preencher_categoria("Fala")
    time.sleep(1)
    home.preencher_objetivo(
        "Melhorar a pronúncia das palavras"
    )
    time.sleep(1)
    home.preencher_conteudo("banana")
    time.sleep(1)
    home.preencher_instrucoes(
        "Repita a palavra lentamente 3 vezes"
    )

    # salva exercício
    time.sleep(1)
    home.clicar_salvar_exercicio()

    # confirma modal
    time.sleep(1)
    home.clicar_ok_modal()

    # volta
    time.sleep(1)
    home.clicar_voltar()

    # abre exercício cadastrado
    time.sleep(1)
    home.clicar_card_exercicio_cadastrado()

    time.sleep(3)


if __name__ == "__main__":
    test_home()
