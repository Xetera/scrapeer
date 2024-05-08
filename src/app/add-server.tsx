import { createSignal } from 'solid-js'
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from '~/components/ui/textfield'

export function AddServer() {
  const [name, setName] = createSignal('')
  return (
    <div class='p-3 '>
      <TextFieldRoot>
        <TextFieldLabel>Name</TextFieldLabel>
        <TextField
          required
          value={name()}
          onChange={(event) => setName(event.target.value)}
        />
      </TextFieldRoot>
    </div>
  )
}
