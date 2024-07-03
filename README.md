# NodeBal

Biblioteca de comunicação com balanças seriais para Node.js.

## Instalação

```bash
yarn add felps-dev/nodebal
```

## Uso

```javascript
import { BalancaPadraoKilo } from "nodebal";

// No Windows, o caminho da porta serial é algo como "COM1"
const balanca = new BalancaPadraoKilo("/dev/tty.usbserial-2130");

balanca
  .lerPeso(300) // 300 é o valor do preço enviado a balança
  .then((peso) => {
    console.log(`Peso lido: ${peso}`);
  })
  .catch((err) => {
    console.error(err);
  });
```

## Parâmetros constructor classe `BalancaBase`

- `porta`: string - Caminho da porta serial
- `serialConfig`: object - Configurações da porta serial
  - `baudRate`: number - Taxa de transmissão (em bauds)
  - `dataBits`: number - Número de bits de dados
  - `stopBits`: number - Número de bits de parada
  - `parity`: string - Paridade
- `timeout`: number - Tempo limite para leitura da porta serial (em milissegundos)

## Parâmetros método `lerPeso` classe `BalancaBase`

- `preco`: number - Valor do preço enviado a balança

## Balanças suportadas (Testadas)

- [x] Urano US 31/2 POP-S (Testada usando BalancaPadraoKilo)
- [x] Toledo Prix 3/16 (Testada usando BalancaPadraoGrama)

## Adicionando suporte a novas balanças

Para adicionar uma nova balança, crie uma nova classe que estenda a classe `BalancaBase`
e implementeos metodos `escreverPreco` e `processaPeso`, e alimente a variável `enqCommand`.
É opicional também alimentar a variável `defaultConfig` com as configurações padrões da balança.
Sendo:

- `escreverPreco`: Método que escreve o preço na balança, deve retornar um `Buffer` com o comando a ser enviado a balança.
- `processaPeso`: Método que processa o peso retornado pela balança, recebe um `Buffer` com o peso retornado pela balança e deve retornar um `number` com o peso processado.
- `enqCommand`: `Buffer` com o comando de requisição de peso.
- `defaultConfig`: Objeto com as configurações padrões da balança.

```javascript
import { BalancaBase } from "./base";

export class BalancaPadraoKilo extends BalancaBase {
  defaultConfig = {
    baudRate: 9600 as const,
    dataBits: 8 as const,
    stopBits: 1 as const,
    parity: "none" as const
  };

  enqCommand = Buffer.from([0x05]);

  escreverPreco(preco: number): Buffer {
    // Escrever o preço na balança
    return Buffer.from([0x02, 0x50, 0x03]);
  }

  processaPeso(data: Buffer): number {
    // Processar o peso retornado pela balança
    return 0;
  }
}
```

Feito isso basta adicionar o export dela no arquivo `index.ts` e pronto, sua balança já está suportada.

#### Caso o `BalancaPadraoKilo` ou `BalancaPadraoGrama` seja o suficiente para a sua balança, favor abrir um PR para adicionar ela ao README.
