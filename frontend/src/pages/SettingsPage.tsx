import React from 'react'
import {connect} from 'react-redux'
import {Message, Icon, Grid, Form, Button, TextArea, Ref, Input, Header, Divider, Popup} from 'semantic-ui-react'
import {useForm} from 'react-hook-form'

import {setLogin} from 'reducers/login'
import {Page, Stats} from 'components'
import api from 'api'
import {findInput} from 'utils'
import {useConfig} from 'config'

const SettingsPage = connect((state) => ({login: state.login}), {setLogin})(function SettingsPage({login, setLogin}) {
  const {register, handleSubmit} = useForm()
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState(null)

  const onSave = React.useCallback(
    async (changes) => {
      setLoading(true)
      setErrors(null)
      try {
        const response = await api.put('/user', {body: {user: changes}})
        setLogin(response.user)
      } catch (err) {
        setErrors(err.errors)
      } finally {
        setLoading(false)
      }
    },
    [setLoading, setLogin, setErrors]
  )

  return (
    <Page>
      <Grid centered relaxed divided>
        <Grid.Row>
          <Grid.Column width={8}>
            <Header as="h2">Your profile</Header>

            <Message info>All of this information is public.</Message>

            <Form onSubmit={handleSubmit(onSave)} loading={loading}>
              <Ref innerRef={findInput(register)}>
                <Form.Input error={errors?.username} label="Username" name="username" defaultValue={login.username} />
              </Ref>
              <Form.Field error={errors?.bio}>
                <label>Bio</label>
                <Ref innerRef={register}>
                  <TextArea name="bio" rows={4} defaultValue={login.bio} />
                </Ref>
              </Form.Field>
              <Form.Field error={errors?.image}>
                <label>Avatar URL</label>
                <Ref innerRef={findInput(register)}>
                  <Input name="image" defaultValue={login.image} />
                </Ref>
              </Form.Field>

              <Button type="submit" primary>
                Save
              </Button>
            </Form>
          </Grid.Column>
          <Grid.Column width={6}>
            <ApiKeyDialog {...{login}} />

            <Divider />

            <Stats user={login.username} />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Page>
  )
})

function CopyInput({value, ...props}) {
  const [success, setSuccess] = React.useState(null)
  const onClick = async () => {
    try {
      await window.navigator?.clipboard?.writeText(value)
      setSuccess(true)
    } catch (err) {
      setSuccess(false)
    } finally {
      setTimeout(() => {
        setSuccess(null)
      }, 2000)
    }
  }

  return (
    <Popup
      trigger={<Input {...props} value={value} fluid action={{icon: 'copy', onClick}} />}
      position="top right"
      open={success != null}
      content={success ? 'Copied.' : 'Failed to copy.'}
    />
  )
}

const selectField = findInput((ref) => ref?.select())

function ApiKeyDialog({login}) {
  const config = useConfig()
  const [show, setShow] = React.useState(false)
  const onClick = React.useCallback(
    (e) => {
      e.preventDefault()
      setShow(true)
    },
    [setShow]
  )

  return (
    <>
      <Header as="h2">Your API Key</Header>
      <p>
        Here you find your API Key, for use in the OpenBikeSensor. You can to copy and paste it into your sensor's
        configuration interface to allow direct upload from the device.
      </p>
      <p>Please protect your API Key carefully as it allows full control over your account.</p>
      <div style={{height: 40, marginBottom: 16}}>
        {show ? (
          <Ref innerRef={selectField}>
            <CopyInput label="Personal API key" value={login.apiKey} />
          </Ref>
        ) : (
          <Button onClick={onClick}>
            <Icon name="lock" /> Show API Key
          </Button>
        )}
      </div>
      <p>The API URL should be set to:</p>
      <CopyInput label="API URL" value={config?.apiUrl ?? '...'} />
    </>
  )
}

export default SettingsPage
