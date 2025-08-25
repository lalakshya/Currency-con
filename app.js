const BASE_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("#convertBtn");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");

for (let select of dropdowns) {
  for (let currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;
    if (select.name === "from" && currCode === "USD") newOption.selected = "selected";
    if (select.name === "to" && currCode === "INR") newOption.selected = "selected";
    select.append(newOption);
  }
  select.addEventListener("change", (evt) => updateFlag(evt.target));
}

const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};


const updateExchangeRate = async () => {
  let amount = document.querySelector(".amount input");
  let amtVal = amount.value;
  amtVal = amtVal.replace(/[^0-9.]/g, "");   
  amtVal = amtVal.replace(/(\..*)\./g, "$1"); 

  if (amtVal === "" || parseFloat(amtVal) < 1) {
    amtVal = "1";
  }
  amount.value = amtVal;
  const from = fromCurr.value.toLowerCase();
  const to = toCurr.value.toLowerCase();
  const URL = `${BASE_URL}/${from}.json`;
  try {
    let response = await fetch(URL);
    let data = await response.json();
    const rate = data[from][to];
    const finalAmount = amtVal * rate;

    let output = `${amtVal} ${fromCurr.value} = ${finalAmount.toFixed(2)} ${toCurr.value}`;
    document.querySelector(".primary").innerText = output;

    const extraCurrencies = ["usd", "eur", "inr", "gbp", "jpy"];
    let table = `<div class="extra-title">Also in:</div><table class="extra-table"><tbody>`;
    extraCurrencies.forEach(curr => {
      if (curr !== from) {
        let value = (amtVal * data[from][curr]).toFixed(2);
        table += `<tr>
          <td>${amtVal} ${fromCurr.value}</td>
          <td>=</td>
          <td>${value}</td>
          <td>${curr.toUpperCase()}</td>
        </tr>`;
      }
    });
    table += `</tbody></table>`;
    document.querySelector(".extras").innerHTML = table;

  } catch (error) {
    msg.innerText = "Error fetching exchange rate.";
    console.error("Fetch error:", error);
  }
};

btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

window.addEventListener("load", () => {
  updateExchangeRate();
  detectUserCurrency();
});

const swapBtn = document.querySelector(".fa-right-left");
swapBtn.addEventListener("click", () => {
  let temp = fromCurr.value;
  fromCurr.value = toCurr.value;
  toCurr.value = temp;
  updateFlag(fromCurr);
  updateFlag(toCurr);
  updateExchangeRate();
});

const darkToggle = document.getElementById("darkToggle");
darkToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  darkToggle.innerText = document.body.classList.contains("dark")
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
});

const detectUserCurrency = async () => {
  try {
    let res = await fetch("https://ipapi.co/json/");
    let data = await res.json();
    let countryCode = data.country_code;
    for (let [currency, code] of Object.entries(countryList)) {
      if (code === countryCode) {
        fromCurr.value = currency;
        updateFlag(fromCurr);
        
        if (toCurr.value === fromCurr.value) {
          toCurr.value = "USD";
          updateFlag(toCurr);
        }

        updateExchangeRate();
        break;
      }
    }
  } catch (error) {
    console.error("Location detection failed:", error);
  }
};

const translations = {
  en: { title: "Currency Converter", enterAmount: "Enter Amount", from: "From", to: "To", convert: "Convert" },
  es: { title: "Convertidor de Moneda", enterAmount: "Ingresar Cantidad", from: "De", to: "A", convert: "Convertir" },
  fr: { title: "Convertisseur de Devises", enterAmount: "Entrer le Montant", from: "De", to: "À", convert: "Convertir" },
  hi: { title: "मुद्रा परिवर्तक", enterAmount: "राशि दर्ज करें", from: "से", to: "तक", convert: "बदलें" },
  zh: { title: "货币转换器", enterAmount: "输入金额", from: "从", to: "到", convert: "转换" },
};
const langSelect = document.getElementById("lang");
langSelect.addEventListener("change", () => {
  let lang = langSelect.value;
  document.querySelector("h2").innerText = translations[lang].title;
  document.querySelector(".amount p").innerText = translations[lang].enterAmount;
  document.querySelector(".from p").innerText = translations[lang].from;
  document.querySelector(".to p").innerText = translations[lang].to;
  document.querySelector("#convertBtn").innerText = translations[lang].convert;
});

