import TextRecognition, {
  TextRecognitionScript,
} from '@react-native-ml-kit/text-recognition';
import { recognizeReceiptText, OcrError } from '../src/api/ocr';

const mockedRecognize = TextRecognition.recognize as jest.MockedFunction<
  typeof TextRecognition.recognize
>;

beforeEach(() => {
  jest.clearAllMocks();
});

test('returns text and isEmpty=false for normal OCR output', async () => {
  mockedRecognize.mockResolvedValueOnce({
    text: 'TOTAL $12.99',
    blocks: [],
  });

  const result = await recognizeReceiptText('file:///tmp/receipt.jpg');

  expect(result.text).toBe('TOTAL $12.99');
  expect(result.isEmpty).toBe(false);
  expect(mockedRecognize).toHaveBeenCalledWith(
    'file:///tmp/receipt.jpg',
    TextRecognitionScript.KOREAN,
  );
});

test('returns isEmpty=true when ML Kit yields empty text', async () => {
  mockedRecognize.mockResolvedValueOnce({ text: '   ', blocks: [] });

  const result = await recognizeReceiptText('file:///tmp/blank.jpg');

  expect(result.isEmpty).toBe(true);
});

test('throws OcrError when ML Kit throws', async () => {
  mockedRecognize.mockRejectedValueOnce(new Error('native module error'));

  await expect(recognizeReceiptText('file:///tmp/bad.jpg')).rejects.toThrow(
    OcrError,
  );
});

test('OcrError preserves the original cause', async () => {
  const cause = new Error('native module error');
  mockedRecognize.mockRejectedValueOnce(cause);

  try {
    await recognizeReceiptText('file:///tmp/bad.jpg');
  } catch (error) {
    expect(error).toBeInstanceOf(OcrError);
    expect((error as OcrError).cause).toBe(cause);
  }
});
