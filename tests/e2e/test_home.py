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
SCREENSHOTS_DIR = "tests/e2e/screenshots"

@pytest.fixture
def driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1920,1080")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
    yield driver
    driver.quit()

@pytest.fixture
def driver_logged_in(driver):
    driver.get(BASE_URL)
    wait = WebDriverWait(driver, 10)
    campo_usuario = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "input[type='text'].native-input")
    ))
    campo_usuario.send_keys(TEST_USER_ADMIN)
    driver.find_element(By.CSS_SELECTOR, "input[type='password'].native-input").send_keys(TEST_PASSWORD)
    driver.find_element(By.XPATH, "//ion-button[@type='submit'] | //button[@type='submit']").click()
    wait.until(EC.url_contains("/home"))
    time.sleep(2)
    return driver

def test_home_carga_correctamente(driver_logged_in):
    driver = driver_logged_in
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "ion-header")))
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-03_home_carga.png")
    assert "/home" in driver.current_url

def test_navbar_visible(driver_logged_in):
    driver = driver_logged_in
    wait = WebDriverWait(driver, 15)
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "ion-header")))
    navbar = driver.find_element(By.CSS_SELECTOR, "ion-header")
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-04_navbar_visible.png")
    assert navbar.is_displayed()

def test_menu_hamburguesa(driver_logged_in):
    driver = driver_logged_in
    wait = WebDriverWait(driver, 15)
    menu_btn = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#navbar-menu")))
    menu_btn.click()
    time.sleep(1)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-05_menu_hamburguesa.png")
    menu = driver.find_element(By.CSS_SELECTOR, "ion-menu")
    assert menu is not None

def test_logout(driver_logged_in):
    driver = driver_logged_in
    wait = WebDriverWait(driver, 15)
    
    logout_btn = wait.until(EC.presence_of_element_located(
        (By.CSS_SELECTOR, "ion-button[style*='19px']")
    ))
    driver.execute_script("arguments[0].click();", logout_btn)
    time.sleep(1)
    
    confirmar = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(@class,'alert-button') and contains(.,'Salir')]")
    ))
    confirmar.click()
    time.sleep(2)
    driver.save_screenshot(f"{SCREENSHOTS_DIR}/ST-06_logout.png")
    assert "login" in driver.current_url.lower()