import { ErrorState, FormData } from "@/types";
import { useRef } from "react";
import { TextInput, View } from "react-native";
import { FormInput } from "../FormInput";
import { formatCardNumber } from "@/utils/helpers/formHelpers";
import { formatExpiry } from "@/utils/helpers/dateHelpers";

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: ErrorState;
  scrollToInput: (ref: React.RefObject<TextInput>) => void;
};

export function CardDetailsSection({
  formData,
  setFormData,
  errors,
  scrollToInput,
}: Props) {
  const cardNumberRef = useRef<TextInput>(null);
  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);
  const cardHolderNameRef = useRef<TextInput>(null);

  return (
    <View>
      <FormInput
        label="Card Number"
        value={formData.cardNumber}
        onChangeText={(text: string) =>
          setFormData({ ...formData, cardNumber: formatCardNumber(text) })
        }
        placeholder="1234 5678 9012 3456"
        keyboardType="numeric"
        maxLength={19}
        error={errors.cardNumber}
        inputRef={cardNumberRef}
        onSubmitEditing={() => expiryRef.current?.focus()}
        onFocus={() => scrollToInput(cardNumberRef)}
      />

      <View className="flex-row space-x-4">
        <View className="flex-1">
          <FormInput
            label="Expiry Date"
            value={formData.expiry}
            onChangeText={(text: string) =>
              setFormData({ ...formData, expiry: formatExpiry(text) })
            }
            placeholder="MM/YY"
            keyboardType="numeric"
            maxLength={5}
            error={errors.expiry}
            inputRef={expiryRef}
            onSubmitEditing={() => cvvRef.current?.focus()}
            onFocus={() => scrollToInput(expiryRef)}
          />
        </View>
        <View className="flex-1">
          <FormInput
            label="CVV"
            value={formData.cvv}
            onChangeText={(text: string) =>
              setFormData({ ...formData, cvv: text })
            }
            placeholder="123"
            keyboardType="numeric"
            maxLength={4}
            error={errors.cvv}
            inputRef={cvvRef}
            onFocus={() => scrollToInput(cvvRef)}
            onSubmitEditing={() => cardHolderNameRef.current?.focus()}
          />
        </View>
      </View>

      <FormInput
        label="Card Holder Name"
        value={formData.cardHolderName}
        onChangeText={(text: string) =>
          setFormData({ ...formData, cardHolderName: text })
        }
        placeholder="e.g., John Doe"
        error={errors.cardHolderName}
        inputRef={cardHolderNameRef}
        onFocus={() => scrollToInput(cardHolderNameRef)}
      />
    </View>
  );
}
