const readline = require("readline")

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log("🔧 MongoDB Connection String Builder")
console.log("=" * 40)

function buildConnectionString() {
  rl.question("Enter your cluster name (e.g., cluster0): ", (cluster) => {
    rl.question("Enter your username: ", (username) => {
      rl.question("Enter your password: ", (password) => {
        rl.question("Enter your project ID (from Atlas URL, optional): ", (projectId) => {
          // Build the connection string
          const baseHost = projectId ? `${cluster}.${projectId}.mongodb.net` : `${cluster}.mongodb.net`

          const connectionString = `mongodb+srv://${username}:${password}@${baseHost}/financial_analytics?retryWrites=true&w=majority`

          console.log("\n✅ Generated Connection String:")
          console.log(connectionString)

          console.log("\n📋 Copy this to your .env.local file:")
          console.log(`MONGODB_URI=${connectionString}`)

          console.log("\n⚠️ Security Notes:")
          console.log("• Never share this connection string")
          console.log("• Don't commit .env.local to version control")
          console.log("• Use strong passwords")

          rl.close()
        })
      })
    })
  })
}

buildConnectionString()
