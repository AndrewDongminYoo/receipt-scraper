import TextRecognition, {
  TextRecognitionScript,
} from '@react-native-ml-kit/text-recognition';

export interface OcrResult {
  text: string;
  isEmpty: boolean;
}

export class OcrError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'OcrError';
  }
}

export async function recognizeReceiptText(
  imageUri: string,
  script: TextRecognitionScript = TextRecognitionScript.KOREAN,
): Promise<OcrResult> {
  try {
    const result = await TextRecognition.recognize(imageUri, script);
    const text = result.text ?? '';
    return { text, isEmpty: text.trim().length === 0 };
  } catch (error) {
    throw new OcrError('Text recognition failed.', error);
  }
}
