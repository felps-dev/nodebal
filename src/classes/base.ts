import { SerialPort, InterByteTimeoutParser } from "serialport";
import { callWithTimeout } from "../utils";

export interface ISerialConfig {
  baudRate: number;
  dataBits: 5 | 6 | 7 | 8 | undefined;
  stopBits: 1 | 1.5 | 2 | undefined;
  parity: "none" | "even" | "mark" | "odd" | "space";
}

export class BalancaBase {
  serialStatus: "open" | "closed" = "closed";
  port: SerialPort;
  defaultConfig: ISerialConfig = {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: "none"
  };

  enqCommand = Buffer.from([0x05]);
  timeout = 5000;

  constructor(port: string, serialConfig?: ISerialConfig, timeout?: number) {
    this.port = new SerialPort({
      path: port,
      autoOpen: false,
      ...this.defaultConfig,
      ...serialConfig
    });
    this.timeout = timeout ?? this.timeout;
  }

  processaPeso(data: Buffer): number {
    throw new Error("Method not implemented.");
  }

  escreverPreco(preco: number): Buffer {
    throw new Error("Method not implemented.");
  }

  private async writeCommand(command: Buffer): Promise<boolean> {
    return await new Promise((resolve, reject) => {
      this.port.write(command, (err) => {
        if (err != null) {
          reject(err);
          return;
        }
        resolve(true);
      });
    });
  }

  private async abrirPorta(): Promise<void> {
    await new Promise((resolve, reject) => {
      if (this.serialStatus === "open") {
        resolve(true);
        return;
      }
      this.port.open((err) => {
        if (err != null) {
          reject(err);
          return;
        }
        this.serialStatus = "open";
        resolve(true);
      });
    });
  }

  private async fecharPorta(): Promise<void> {
    await new Promise((resolve, reject) => {
      if (this.serialStatus === "closed") {
        resolve(true);
        return;
      }
      this.port.close((err) => {
        if (err != null) {
          reject(err);
          return;
        }
        this.serialStatus = "closed";
        resolve(true);
      });
    });
  }

  private async readPeso(preco?: number): Promise<number> {
    let pesoLido: number = 0;
    while (pesoLido === 0) {
      pesoLido = await new Promise((resolve, reject) => {
        this.writeCommand(this.enqCommand).catch(reject);
        const parser = this.port.pipe(
          new InterByteTimeoutParser({ interval: 80 })
        );
        parser.once("data", async (data: Buffer) => {
          try {
            if (preco != null) {
              const pesoEscrever = this.escreverPreco(preco);
              await this.writeCommand(pesoEscrever);
            }
            const weight = this.processaPeso(data);
            if (weight > 0) {
              resolve(weight);
              return;
            }
          } catch (err) {
            reject(err);
            return;
          }
          resolve(0);
        });
      });
    }
    return pesoLido;
  }

  /**
   * Lê o peso da balança
   * @param preco Preço a ser escrito na balança
   * @returns Peso lido
   * @throws {Error} Se ocorrer um erro ao ler o peso
   *
   * @example
   * const balanca = new ToledoUS312POP5("/dev/tty.usbserial-2130");
   *
   * balanca
   *  .lerPeso(300)
   * .then((peso) => {
   *   console.log(`Peso lido: ${peso}`);
   * })
   * */
  async lerPeso(preco?: number): Promise<number> {
    try {
      await this.abrirPorta();
      const pesoPromise = this.readPeso(preco);
      const result = await callWithTimeout(
        async () => await pesoPromise,
        this.timeout,
        "Timeout ao ler peso"
      );
      await this.fecharPorta();
      return result;
    } catch (err) {
      await this.fecharPorta();
      throw err;
    }
  }
}
