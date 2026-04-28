interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  buildingName: string;
  apartment: string;
  addressType: "R" | "J";
}

interface DaumPostcodeInstance {
  embed: (element: HTMLElement) => void;
  open: () => void;
}

declare global {
  interface Window {
    daum: {
      Postcode: new (config: {
        oncomplete: (data: DaumPostcodeData) => void;
        width?: string | number;
        height?: string | number;
      }) => DaumPostcodeInstance;
    };
  }
}

export {};
