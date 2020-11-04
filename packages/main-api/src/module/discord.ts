import express, { json, Request, Response } from 'express'
import fetch from 'node-fetch'
import btoa from 'btoa'
import catchAsync from '../util'
import discord from 'discord.js'
import { access } from 'fs'

const router = express.Router()

// some env vars that might could be in config.js
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const BOT_TOKEN = process.env.BOT_TOKEN
const SERVER_ID = process.env.SERVER_ID

// this role name might could move as well
const portalerRole = 'portaler'

const redirect = encodeURIComponent(
  'http://localhost:4000/api/discord/callback'
)
const client = new discord.Client()
client.login(BOT_TOKEN)

client.on('ready', () => {
  console.log('I am ready!')
})

// client.login()

router.get('/login', (req: Request, res: Response) => {
  res.redirect(
    `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds%20connections`
  )
})

router.get(
  '/callback',
  catchAsync(async (req: Request, res: Response) => {
    if (!req.query.code) throw new Error('NoCodeProvided')
    const code = req.query.code
    const creds = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    const data = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'http://localhost:4000/api/discord/callback',
      scope: 'identify and guild',
    }
    const response = await fetch(`https://discord.com/api/v6/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${creds}`,
        ContentType: `application/x-www-form-urlencoded`,
      },
      body: new URLSearchParams(data as any), // TODO figure out what to do with this type
    })
    const jsonresponse = await response.json()

    // getGuilds(jsonresponse.access_token)
    const guildMembers = (await client.guilds.fetch('766363497562898434'))
      .members
    const guild = await client.guilds.fetch('766363497562898434')

    const userID = await getMe(jsonresponse.access_token)
    if (userID === '') {
      // we should return some error here
    }
    // console.log(userID)

    const userResolvable = new discord.User(client, {
      id: userID,
    })
    const user = guild.members.resolve(userResolvable)
    console.log(user)

    // TODO replace this with where your site is servered from or serve from this same server
    res.redirect(`http://localhost:8080/?token=${jsonresponse.access_token}`)
  })
)

module.exports = router

function getGuilds(access_token: string) {
  const response = fetch(`https://discord.com/api/users/@me/guilds`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  })
    .then((res) => res.json())
    .then((jsonData) => {
      console.log(jsonData)
    })
}

const getMe = async (access_token: string): Promise<string> => {
  const json = await fetch(`https://discord.com/api/users/@me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  }).then((res) => res.json())

  console.log(json)
  return json.id
}

;(async () => {
  // const guildMembers = (await client.guilds.fetch('766363497562898434')).members
  const guild = await client.guilds.fetch('766363497562898434')
  // tuna - 200807920827498497
  // matt - 100057976752082944
  // bot - 766367559385350154
  const userResolvable = new discord.User(client, {
    id: '766367559385350154',
  })
  const user = guild.members.resolve(userResolvable)
  console.log(user)
})()
