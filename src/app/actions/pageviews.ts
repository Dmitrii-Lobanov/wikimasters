"use server";

import redis from "@/cache";
import sendCelebrationEmail from "@/email/celebration-email";

const milestones = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000, 10000];

const keyFor = (id: number | string) => `pageviews:article:${id}`;

export async function incrementPageview(articleId: number) {
  const articleKey = keyFor(articleId);

  const newVal = await redis.incr(articleKey);

  console.log(newVal, milestones.includes(newVal), milestones);

  if (milestones.includes(newVal)) {
    sendCelebrationEmail(articleId, +newVal); // don't await so we don't block on sending the email, just send it
  }

  return +newVal;
}
