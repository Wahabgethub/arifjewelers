const RAW_WA = "03092276875";

function toIntlNumber(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return "92" + digits.slice(1);
  return digits;
}

export const WA_NUMBER_INTL = toIntlNumber(RAW_WA);
export const WA_DISPLAY = RAW_WA;

export function whatsappLink(message = "") {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WA_NUMBER_INTL}?text=${encoded}`;
}

export function callLink() {
  return `tel:${RAW_WA}`;
}

export function askPriceMessage(productName, language = "en") {
  const templates = {
    en: `Assalam-o-Alaikum! I would like to know the price of "${productName}" from Arif Jewellers. Please share details.`,
    ur: `السلام علیکم! میں Arif Jewellers سے "${productName}" کی قیمت جاننا چاہتا/چاہتی ہوں۔ برائے مہربانی تفصیلات بھیجیں۔`,
    sd: `السلام عليڪم! مان Arif Jewellers کان "${productName}" جي قيمت ڄاڻڻ گھران ٿو. مهرباني ڪري تفصيل موڪليو.`,
  };
  return templates[language] || templates.en;
}
