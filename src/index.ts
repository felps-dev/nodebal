import { ToledoUS312POP5 } from "./classes/toledo";

const balanca = new ToledoUS312POP5("/dev/tty.usbserial-2130");

balanca
  .lerPeso(300)
  .then((peso) => {
    console.log(`Peso lido: ${peso}`);
  })
  .catch((err) => {
    console.error(err);
  });
