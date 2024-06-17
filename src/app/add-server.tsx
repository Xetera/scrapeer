import {
  Checkbox,
  CheckboxControl,
  CheckboxDescription,
  CheckboxLabel,
} from '~/components/ui/checkbox'
import {
  TextField,
  TextFieldLabel,
  TextFieldRoot,
} from '~/components/ui/textfield'
import { ServerAutonomy } from '~/protocol/scrapeer'
import { useBrowserStorage } from '~/shared/hooks'

export function AddServer() {
  const { value: name, set: setName } = useBrowserStorage('server:name', '')
  const { value: url, set: setUrl } = useBrowserStorage('server:url', '')
  const { value: token, set: setToken } = useBrowserStorage('server:token', '')
  const { value: enabled, set: toggleEnabled } = useBrowserStorage(
    'server:enabled',
    false,
  )
  const { value: autonomy, set: setAutonomy } = useBrowserStorage(
    'server:autonomy',
    ServerAutonomy.Passive,
  )
  return (
    <div class='p-3 flex flex-col gap-3'>
      <TextFieldRoot>
        <TextFieldLabel>Server Name</TextFieldLabel>
        <TextField
          required
          value={name()}
          onChange={(event) => setName(event.target.value)}
        />
      </TextFieldRoot>
      <TextFieldRoot>
        <TextFieldLabel>Server Url</TextFieldLabel>
        <TextField
          required
          value={url()}
          onChange={(event) => setUrl(event.target.value)}
        />
      </TextFieldRoot>
      <TextFieldRoot>
        <TextFieldLabel>Token</TextFieldLabel>
        <TextField
          required
          value={token()}
          onChange={(event) => setToken(event.target.value)}
        />
      </TextFieldRoot>
      <Checkbox
        checked={enabled()}
        onChange={(state) => toggleEnabled(state)}
        class='flex gap-3'
      >
        <CheckboxControl />
        <CheckboxLabel>Server Enabled</CheckboxLabel>
      </Checkbox>
      <Checkbox
        checked={autonomy() === ServerAutonomy.Active}
        onChange={(state) =>
          setAutonomy(state ? ServerAutonomy.Active : ServerAutonomy.Passive)
        }
        class='flex gap-3'
      >
        <CheckboxControl />
        <div class='flex flex-col'>
          <CheckboxLabel>Turn on active scraping mode</CheckboxLabel>
          <CheckboxDescription class='text-stone-5'>
            Spatula will process jobs from '{name()}'.{' '}
            <a
              target='_blank'
              class='text-blue-3'
              href='https://github.com/xetera/scrapeer#active-mode'
              rel='noreferrer'
            >
              Click to learn more
            </a>
          </CheckboxDescription>
        </div>
      </Checkbox>
    </div>
  )
}
