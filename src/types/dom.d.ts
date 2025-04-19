interface HTMLElement {
  value: string;
  placeholder: string;
  checked: boolean;
  textContent: string | null;
  dataset: DOMStringMap;
}

interface HTMLInputElement extends HTMLElement {
  value: string;
  checked: boolean;
}

interface HTMLSelectElement extends HTMLElement {
  value: string;
  options: HTMLCollectionOf<HTMLOptionElement>;
}

interface HTMLOptionElement extends HTMLElement {
  value: string;
  selected: boolean;
}

interface DOMStringMap {
  [key: string]: string;
}
