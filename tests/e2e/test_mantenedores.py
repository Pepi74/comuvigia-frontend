import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import time
import os

load_dotenv()

BASE_URL = os.environ.get("BASE_URL", "").strip()
TEST_USER_ADMIN = os.environ.get("TEST_USER_ADMIN", "").strip()
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "").strip()
TEST_USER_OPERATOR = os.environ.get("TEST_USER_OPERATOR", "").strip()
SCREENSHOTS_DIR = "tests/e2e/screenshots"

@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    service = Service(ChromeDriverManager().install())
    d = webdriver.Chrome(service=service, options=options)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    yield d
    d.quit()

def _login(driver, username, password):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)
    campo_usuario = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[type='text'].native-input")
    ))
    campo_usuario.send_keys(username)
    driver.find_element(By.CSS_SELECTOR, "input[type='password'].native-input").send_keys(password)
    driver.find_element(By.XPATH, "//ion-button[@type='submit'] | //button[@type='submit']").click()
    WebDriverWait(driver, 10).until(EC.url_contains("/home"))
    time.sleep(2)

def _abrir_popover_mantenedores(driver):
    wait = WebDriverWait(driver, 15)
    fab = wait.until(EC.element_to_be_clickable(
        (By.CSS_SELECTOR, "ion-fab-button#mantenedores-fab")
    ))
    driver.execute_script("arguments[0].click();", fab)
    time.sleep(1)

def _texto_en_dom_completo(driver):
    return driver.execute_script("""
        function getTextFromNode(node) {
            let text = '';
            if (node.shadowRoot) {
                text += getTextFromNode(node.shadowRoot);
            }
            for (let child of node.childNodes) {
                if (child.nodeType === Node.TEXT_NODE) {
                    text += child.textContent;
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    text += getTextFromNode(child);
                }
            }
            return text;
        }
        return getTextFromNode(document.body);
    """)

@pytest.fixture
def driver_admin(driver):
    _login(driver, TEST_USER_ADMIN, TEST_PASSWORD)
    return driver

@pytest.fixture
def driver_funcionario(driver):
    _login(driver, TEST_USER_OPERATOR, TEST_PASSWORD)
    return driver

def test_fab_mantenedores_abre_popover(driver_admin):
    driver = driver_admin
    wait = WebDriverWait(driver, 15)
    _abrir_popover_mantenedores(driver)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-08_fab_mantenedores.png")
    popover = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "ion-popover")))
    assert popover is not None

def test_admin_ve_opcion_usuarios(driver_admin):
    driver = driver_admin
    _abrir_popover_mantenedores(driver)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-09_admin_opcion_usuarios.png")
 
    texto_dom = _texto_en_dom_completo(driver)
    assert "Usuarios" in texto_dom or "usuarios" in texto_dom, \
        "El admin ve la opción 'Usuarios' en el popover de mantenedores"

def test_funcionario_no_ve_opcion_usuarios(driver_funcionario):
    driver = driver_funcionario
    _abrir_popover_mantenedores(driver)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-10_funcionario_sin_usuarios.png")
 
    texto_dom = _texto_en_dom_completo(driver)
    assert "Usuarios" not in texto_dom and "usuarios" not in texto_dom, \
        "El funcionario no debería ver la opción 'Usuarios' en el popover de mantenedores"