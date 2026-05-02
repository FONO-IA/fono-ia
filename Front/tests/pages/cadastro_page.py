from selenium.webdriver.common.by import By

# Classe da tela de cadastro.
class CadastroPage:

    def __init__(self, driver):
        self.driver = driver

    def preencher_nome(self, nome):
        self.driver.find_element(By.ID, "nome").send_keys(nome)

    def preencher_cpf(self, cpf):
        self.driver.find_element(By.ID, "cpf").send_keys(cpf)

    def preencher_crfa(self, crfa):
        self.driver.find_element(By.ID, "crfa").send_keys(crfa)

    def preencher_telefone(self, telefone):
        self.driver.find_element(By.ID, "telefone").send_keys(telefone)

    def preencher_email(self, email):
        self.driver.find_element(By.ID, "email").send_keys(email)

    def clicar_cadastrar(self):
        self.driver.find_element(By.ID, "btn-cadastrar").click()
