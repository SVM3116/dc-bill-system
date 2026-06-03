/**
 * Converts a number to its Indian English words representation.
 * E.g., 1500 -> "One Thousand Five Hundred Rupees Only"
 * E.g., 250000.50 -> "Two Lakh Fifty Thousand Rupees and Fifty Paise Only"
 */
export function convertNumberToWords(num: number): string {
  if (isNaN(num) || num <= 0) return "";
  
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  
  const convertSection = (n: number): string => {
    if (n < 20) return a[n];
    const digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : "");
  };
  
  const convertHundreds = (n: number): string => {
    if (n < 100) return convertSection(n);
    const hundreds = Math.floor(n / 100);
    const rem = n % 100;
    return a[hundreds] + " Hundred" + (rem ? " and " + convertSection(rem) : "");
  };

  // Split integer and decimal parts
  const parts = num.toFixed(2).split(".");
  const integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  let result = "";

  if (integerPart > 0) {
    let n = integerPart;
    const crore = Math.floor(n / 10000000);
    n %= 10000000;
    const lakh = Math.floor(n / 100000);
    n %= 100000;
    const thousand = Math.floor(n / 1000);
    n %= 1000;
    const remaining = n;

    let str = "";
    if (crore > 0) {
      str += convertHundreds(crore) + " Crore ";
    }
    if (lakh > 0) {
      str += convertHundreds(lakh) + " Lakh ";
    }
    if (thousand > 0) {
      str += convertHundreds(thousand) + " Thousand ";
    }
    if (remaining > 0) {
      str += convertHundreds(remaining) + " ";
    }
    result = str.trim() + " Rupees";
  }

  if (decimalPart > 0) {
    const paiseStr = convertSection(decimalPart);
    if (result) {
      result += " and " + paiseStr + " Paise";
    } else {
      result = paiseStr + " Paise";
    }
  }

  return result ? result + " Only" : "";
}
