
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    const seedFile = path.join(__dirname, '../seed_data.json')
    let initialData: any[] = []

    if (fs.existsSync(seedFile)) {
        const raw = fs.readFileSync(seedFile, 'utf-8')
        initialData = JSON.parse(raw)
        console.log(`Loaded ${initialData.length} items from seed_data.json`)
    } else {
        console.log('No seed_data.json found. Using default empty list.')
    }

    for (const game of initialData) {
        // Check if exists by title to avoid duplicates if re-seeding
        const existing = await prisma.drinkingGame.findFirst({
            where: { title: game.title } // Assuming title is unique-ish or just check
        })

        if (!existing) {
            await prisma.drinkingGame.create({
                data: {
                    title: game.title,
                    description: game.description,
                    // We let Postgres handle ID
                }
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
