import { BalancaBase } from "./base";

export class BalancaPadraoKilo extends BalancaBase {
  /**
   * Balança padrão para leitura de peso em kilogramas
   * Ex: 0,045
   **/

  defaultConfig = {
    baudRate: 9600 as const,
    dataBits: 8 as const,
    stopBits: 1 as const,
    parity: "none" as const
  };

  enqCommand = Buffer.from([0x05]);

  escreverPreco(preco: number): Buffer {
    const formattedPrice = preco.toFixed(2).replace(".", "").padStart(6, "0");
    const priceMessage = Buffer.from([
      0x02,
      ...formattedPrice.split("").map((char: string) => char.charCodeAt(0)),
      0x03
    ]);
    return priceMessage;
  }

  processaPeso(data: Buffer): number {
    const response = data.toString();
    if (response.startsWith("\x02") && response.endsWith("\x03")) {
      // Processar a resposta do peso
      const weight = response.slice(1, -1); // Remover STX e ETX
      const numericWeight = parseFloat(weight.replace(",", ".")); // Converter para número
      return numericWeight;
    }
    const chars = response.split("").map((char) => char.charCodeAt(0));
    throw new Error(
      "Invalid weight response: " + response + " " + chars.join(",")
    );
  }
}

export class BalancaPadraoGrama extends BalancaPadraoKilo {
  /**
   * Balança padrão para leitura de peso em gramas
   * Ex: 45 -> 0,045
   **/
  processaPeso(data: Buffer): number {
    // Extamente igual, mas divide por 1000
    // para converter de gramas para kilogramas
    return super.processaPeso(data) / 1000;
  }
}
