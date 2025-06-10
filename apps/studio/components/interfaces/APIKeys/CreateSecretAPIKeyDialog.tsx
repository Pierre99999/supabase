import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogSection,
  DialogSectionSeparator,
  DialogTitle,
  DialogTrigger,
  FormControl_Shadcn_,
  FormField_Shadcn_,
  Form_Shadcn_,
  Input_Shadcn_,
} from 'ui'
import { FormItemLayout } from 'ui-patterns/form/FormItemLayout/FormItemLayout'
import * as z from 'zod'

import { useParams } from 'common'
import { useAPIKeyCreateMutation } from 'data/api-keys/api-key-create-mutation'
import { Plus } from 'lucide-react'

const NAME_SCHEMA = z
  .string()
  .min(4, 'Name must be at least 4 characters')
  .max(64, "Name can't be more than 64 characters long")
  .regex(/^[a-z0-9_]+$/, 'Name can only contain lowercased letters, digits and underscore')
  .refine((val: string) => !val.match(/^[0-9].+$/), 'Name must not start with a digit')
  .refine(
    (val: string) => val !== 'anon' && val !== 'service_role',
    'Using "anon" or "service_role" for API key name is not possible'
  )

const FORM_ID = 'create-secret-api-key'
const SCHEMA = z.object({
  name: NAME_SCHEMA,
  description: z.string().max(256, "Description shouldn't be too long").trim(),
})

const CreateSecretAPIKeyDialog = () => {
  const [visible, setVisible] = useState(false)
  const { ref: projectRef } = useParams()

  const onClose = (value: boolean) => {
    setVisible(value)
  }

  const form = useForm<z.infer<typeof SCHEMA>>({
    resolver: zodResolver(SCHEMA),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const { mutate: createAPIKey, isLoading: isCreatingAPIKey } = useAPIKeyCreateMutation()

  const onSubmit: SubmitHandler<z.infer<typeof SCHEMA>> = async (values) => {
    await createAPIKey(
      {
        projectRef,
        type: 'secret',
        name: values.name,
        description: values.description,
      },
      {
        onSuccess: () => {
          onClose(false)
        },
      }
    )
  }

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <Button type="default" className="mt-2" icon={<Plus />}>
          Add new secret key
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new secret API key</DialogTitle>
          <DialogDescription className="grid gap-y-2">
            <p>
              Secret API keys are used to authorize requests to your project from servers,
              functions, workers or other backend components of your application.{' '}
            </p>

            <p>
              Keep these keys private. Don't publish them online or commit them to source control.
              They don't work when used in a browser.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogSectionSeparator />
        <DialogSection className="flex flex-col gap-4">
          <Form_Shadcn_ {...form}>
            <form
              className="flex flex-col gap-4"
              id={FORM_ID}
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField_Shadcn_
                key="name"
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItemLayout
                    label="Name"
                    description="A short, unique name of lowercased letters, digits and underscore"
                  >
                    <FormControl_Shadcn_>
                      <Input_Shadcn_ {...field} placeholder="Example: my_super_secret_key_123" />
                    </FormControl_Shadcn_>
                  </FormItemLayout>
                )}
              />
              <FormField_Shadcn_
                key="description"
                name="description"
                control={form.control}
                render={({ field }) => (
                  <FormItemLayout
                    label="Description"
                    description="Write down some notes on how or where this key is used for"
                  >
                    <FormControl_Shadcn_>
                      <Input_Shadcn_ {...field} placeholder="(Optional)" />
                    </FormControl_Shadcn_>
                  </FormItemLayout>
                )}
              />
            </form>
          </Form_Shadcn_>
        </DialogSection>
        <DialogFooter>
          <Button form={FORM_ID} htmlType="submit" loading={isCreatingAPIKey}>
            Create API key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSecretAPIKeyDialog
