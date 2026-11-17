import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.author.upsert({
    where: { slug: "maren" },
    update: {},
    create: {
      name: "Maren",
      slug: "maren",
      bio: "Editorial pen name for Recipes by Maren."
    }
  });

  const categories = [
    ["Weeknight Dinners", "weeknight-dinners"],
    ["One-Pot Meals", "one-pot-meals"],
    ["Air Fryer", "air-fryer"],
    ["Budget-Friendly", "budget-friendly"],
    ["Desserts & Baking", "desserts-baking"]
  ];

  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
