import { common, createLowlight } from "lowlight";
import ts from "highlight.js/lib/languages/typescript";

const lowlight = createLowlight(common);
lowlight.register({ ts });

export default lowlight;
