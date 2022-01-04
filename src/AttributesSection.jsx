import { Button, IconButton } from "@chakra-ui/button";
import { Heading, HStack } from "@chakra-ui/layout";
import { Textarea } from "@chakra-ui/react";
import { AlertIcon, Alert } from "@chakra-ui/alert";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MdEdit, MdRestore } from "react-icons/md";
import JSONCode from "./JSONCode";

export default function AttributesSection({ attrs, setAttrs, hasOverrides }) {
  const [edit, setEdit] = useState(false);
  const form = useForm({
    defaultValues: {
      attrs: JSON.stringify(attrs, null, 2),
    },
  });
  const [error, setError] = useState("");

  return (
    <div>
      <Heading as="h2" size="md" mb={2}>
        User Attributes
        {!edit && (
          <IconButton
            size="xs"
            variant="ghost"
            ml={2}
            icon={<MdEdit size="18px"  />}
            aria-label="Edit User Attributes"
            title="Edit User Attributes"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setEdit(true);
              form.reset({
                attrs: JSON.stringify(attrs, null, 2),
              });
            }}
          />
        )}
        {!edit && hasOverrides && (
          <IconButton
            size="xs"
            variant="ghost"
            icon={<MdRestore size="18px" />}
            aria-label="Restore User Attributes"
            title="Restore User Attributes"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAttrs(null);
            }}
          />
        )}
      </Heading>
      {edit ? (
        <form
          onSubmit={form.handleSubmit(async (value) => {
            try {
              const parsed = JSON.parse(value.attrs);
              setAttrs(parsed);
              setError("");
              setEdit(false);
            } catch (e) {
              setError(e.message);
            }
          })}
        >
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}
          <Textarea {...form.register("attrs")} rows={12} mb={2} autoFocus />
          <HStack spacing={5}>
            <Button colorScheme="purple" type="submit">
              Save
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setEdit(false);
              }}
            >
              Cancel
            </Button>
          </HStack>
        </form>
      ) : (
        <JSONCode code={attrs} />
      )}
    </div>
  );
}
