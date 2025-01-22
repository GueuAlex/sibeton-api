import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTables() {
  try {
    // First delete all OrderProduct records since they reference Orders
    console.log('Deleting OrderProduct records...')
    await prisma.orderProduct.deleteMany({})
    
    // Then delete all Invoice records since they reference Orders
    console.log('Deleting Invoice records...')
    await prisma.invoice.deleteMany({})
    
    // Finally delete all Order records
    console.log('Deleting Order records...')
    await prisma.order.deleteMany({})
    
    console.log('All records deleted successfully!')
  } catch (error) {
    console.error('Error clearing tables:', error)
  } finally {
    await prisma.$disconnect()
  }
}

export default clearTables()