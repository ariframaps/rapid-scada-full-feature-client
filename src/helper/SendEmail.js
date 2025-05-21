import emailjs from "@emailjs/browser";
import { UAParser } from "ua-parser-js";

export const sendEmail = () => {
  const parser = new UAParser();
  const result = parser.getResult();

  const userAgent = {
    browser: result.browser.name,
    os: result.os.name,
    device: result.device.type,
    time: new Date().toLocaleString(),
  };

  emailjs
    .send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        message: JSON.stringify(userAgent, null, 2), // null dan 2 biar lebih rapi formatnya
      },
      {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      }
    )
    .then(
      () => {
        console.log("SUCCESS!");
      },
      (error) => {
        console.log("FAILED...", error.text);
      }
    );
};
