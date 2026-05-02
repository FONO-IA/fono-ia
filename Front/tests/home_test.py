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

    time.sleep(2)

    # Adicionar o email e a senha do cadastro:
    login.preencher_email("")
    login.preencher_senha("")

    time.sleep(2)
    login.clicar_entrar()

    # espera ir pro admin
    wait.until(EC.url_contains("/admin"))

    time.sleep(2)
    # Executa a ação na home
    home.clicar_novoPaciente()


if __name__ == "__main__":
    test_home()
