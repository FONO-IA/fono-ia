# Importa o By para localizar os elementos da página.
from selenium.webdriver.common.by import By

# Classe que guarda elementos da página e realiza ações na tela de cadastro.
class CadastroPage:

    # Método construtor da classe.
    def __init__(self, driver):
        # Salva o navegador dentro da classe.
        self.driver = driver

    # Função para preencher os campos que recebe 2 parâmetros: self(referência da própria classe) e o valor a ser preenchido, no caso nome.
    def preencher_nome(self, nome):
        # find_element procura elemento HTML, By.ID Procura pelo atributo id="" no HTML, send_keys() digita o texto no campo.
        self.driver.find_element(By.ID, "nome").send_keys(nome)

    def preencher_cpf(self, cpf):
        self.driver.find_element(By.ID, "cpf").send_keys(cpf)

    def preencher_crfa(self, crfa):
        self.driver.find_element(By.ID, "crfa").send_keys(crfa)

    def preencher_telefone(self, telefone):
        self.driver.find_element(By.ID, "telefone").send_keys(telefone)

    def preencher_email(self, email):
        self.driver.find_element(By.ID, "email").send_keys(email)
    # função que clica no botão
    def clicar_cadastrar(self):
        #  .click() executa a ação de clicar no botão referente ao ID
        self.driver.find_element(By.ID, "btn-cadastrar").click()
