import { BalancaPadraoKilo } from "./classes/padrao";

const balanca = new BalancaPadraoKilo("/dev/tty.usbserial-2130");

balanca
  .lerPeso(300)
  .then((peso) => {
    console.log(`Peso lido: ${peso}`);
  })
  .catch((err) => {
    console.error(err);
  });
