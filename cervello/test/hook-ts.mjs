// Aggancia il risolutore di risolvi-ts.mjs al caricatore di moduli (AR-156).
// Va passato a Node con `--import`, perché i hook vanno registrati PRIMA che parta il test.
import { register } from "node:module";

register("./risolvi-ts.mjs", import.meta.url);
