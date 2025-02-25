import { useRef } from "react";
import { TextInput, View } from "react-native";
import { FormInput } from "../FormInput";
import { ErrorState, FormData } from "@/types";

type Props = {
  formData: FormData;
  setFormData: (data: FormData) => void;
  errors: ErrorState;
  scrollToInput: (ref: React.RefObject<TextInput>) => void;
};

export function BillingInformationSection({
  formData,
  setFormData,
  errors,
  scrollToInput,
}: Props) {
  const billDateRef = useRef<TextInput>(null);
  const dueDateRef = useRef<TextInput>(null);
  const limitRef = useRef<TextInput>(null);

  return (
    <View>
      <View className="flex-row space-x-4">
        <View className="flex-1">
          <FormInput
            label="Bill Date"
            value={formData.billDate}
            onChangeText={(text: string) =>
              setFormData({ ...formData, billDate: text })
            }
            placeholder="e.g., 15"
            keyboardType="numeric"
            maxLength={2}
            error={errors.billDate}
            inputRef={billDateRef}
            onSubmitEditing={() => dueDateRef.current?.focus()}
            onFocus={() => scrollToInput(billDateRef)}
          />
        </View>
        <View className="flex-1">
          <FormInput
            label="Due Date"
            value={formData.dueDate}
            onChangeText={(text: string) =>
              setFormData({ ...formData, dueDate: text })
            }
            placeholder="e.g., 25"
            keyboardType="numeric"
            maxLength={2}
            error={errors.dueDate}
            inputRef={dueDateRef}
            onSubmitEditing={() => limitRef.current?.focus()}
            onFocus={() => scrollToInput(dueDateRef)}
          />
        </View>
      </View>

      <FormInput
        label="Credit Limit"
        value={formData.limit}
        onChangeText={(text: string) =>
          setFormData({ ...formData, limit: text })
        }
        placeholder="e.g., 5000"
        keyboardType="numeric"
        error={errors.limit}
        inputRef={limitRef}
        onFocus={() => scrollToInput(limitRef)}
      />
    </View>
  );
}
