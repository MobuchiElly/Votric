import { prisma } from "@/lib/prisma";
import type { CreatePollInput, UpdatePollInput } from "@/schemas/poll.schema";
import { Description } from "@radix-ui/react-dialog";


export async function createPoll(userId: string, input: CreatePollInput) {
  const poll = await prisma.poll.create({
    data: {
      title: input.title,
      description: input.description || null,
      creator: {
        connect: { id: userId },
      },
      options: {
        create: input.options.map((option) => ({
          option_text: option,
        })),
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      creator_id: true,
      created_at: true,
      options: {
        select: {
          id: true,
          option_text: true,
        },
      },
    },
  });

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    options: poll.options.map((option) => ({
      id: option.id,
      text: option.option_text,
      votes: 0,
    })),
    totalVotes: 0,
    createdAt: poll.created_at,
    createdBy: poll.creator_id,
    isOwned: true,
  };
}


export async function getPolls(userId: string, voted: boolean) {
  const polls = await prisma.poll.findMany({
    where: {
      status: {
        notIn: ["ARCHIVED", "DELETED"],
      },
      ...(voted
        ? { votes: { some: { voter_id: userId } } }
        : { creator_id: userId }),
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      creator_id: true,
      created_at: true,
      status: true,

      creator: {
        select: {
          id: true,
          name: true,
        },
      },

      options: {
        select: {
          id: true,
          option_text: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },

      _count: {
        select: {
          votes: true,
        },
      },

      votes: {
        where: {
          voter_id: userId,
        },
        select: {
          option_id: true,
        },
        take: 1,
      },
    },
  });

  return polls.map((poll) => {
    const totalVotes = poll._count.votes;

    const options = poll.options.map((option) => {
      const voteCount = option._count.votes;

      const percentage =
        totalVotes === 0
          ? 0
          : Math.round((voteCount / totalVotes) * 10000) / 100;

      return {
        id: option.id,
        text: option.option_text,
        votes: voteCount,
        percentage,
      };
    });

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      options,
      totalVotes,
      createdAt: poll.created_at,

      creator: {
        id: poll.creator_id,
        name: poll.creator?.name ?? "NA",
      },

      createdBy: poll.creator_id,
      isOwned: poll.creator_id === userId,

      hasVoted: poll.votes.length > 0,
      myVoteOptionId: poll.votes[0]?.option_id ?? null,
    };
  });
}



export async function getPublicPollFeed(
  userId: string,
  page: number = 1,
  limit: number = 10,
  search: string = "",
) {
  const skip = (page - 1) * limit;
  const searchTerm = search.trim();

  const where = {
    status: "ACTIVE" as const,
    OR: [
      { creator_id: { not: userId } },
      { creator_id: null },
    ],
    ...(searchTerm
      ? {
          AND: [
            {
              OR: [
                {
                  title: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  description: {
                    contains: searchTerm,
                    mode: "insensitive" as const,
                  },
                },
                {
                  options: {
                    some: {
                      option_text: {
                        contains: searchTerm,
                        mode: "insensitive" as const,
                      },
                    },
                  },
                },
              ],
            },
          ],
        }
      : {}),
  };

  const [polls, totalPolls] = await prisma.$transaction([
    prisma.poll.findMany({
      where,
      orderBy: [
        { created_at: "desc" },
        { id: "desc" },
      ],
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        creator_id: true,
        created_at: true,
        status: true,

        creator: {
          select: {
            id: true,
            name: true,
          },
        },

        options: {
          select: {
            id: true,
            option_text: true,
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },

        _count: {
          select: {
            votes: true,
          },
        },

        votes: {
          where: {
            voter_id: userId,
          },
          select: {
            option_id: true,
          },
          take: 1,
        },
      },
    }),

    prisma.poll.count({ where }),
  ]);

  const data = polls.map((poll) => {
    const totalVotes = poll._count.votes;

    const options = poll.options.map((option) => {
      const votes = option._count.votes;

      const percentage =
        totalVotes === 0
          ? 0
          : Math.round((votes / totalVotes) * 10000) / 100;

      return {
        id: option.id,
        text: option.option_text,
        votes,
        percentage,
      };
    });

    return {
      id: poll.id,
      title: poll.title,
      description: poll.description,
      status: poll.status,
      createdAt: poll.created_at,

      creator: {
        id: poll.creator_id,
        name: poll.creator?.name ?? "NA",
      },

      createdBy: poll.creator_id,
      isOwned: poll.creator_id === userId,

      totalVotes,
      hasVoted: poll.votes.length > 0,
      myVoteOptionId: poll.votes[0]?.option_id ?? null,

      options,
    };
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total: totalPolls,
      totalPages: Math.ceil(totalPolls / limit),
      hasNextPage: page * limit < totalPolls,
      hasPreviousPage: page > 1,
    },
  };
}


export async function getPollById(
  pollId: string,
  userId: string,
) {
  const poll = await prisma.poll.findFirst({
    where: {
      id: pollId,
      status: {
        not: "DELETED",
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      creator_id: true,
      created_at: true,
      status: true,

      creator: {
        select: {
          id: true,
          name: true,
        },
      },

      options: {
        select: {
          id: true,
          option_text: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },

      _count: {
        select: {
          votes: true,
        },
      },

      votes: {
        where: {
          voter_id: userId,
        },
        select: {
          option_id: true,
        },
        take: 1,
      },
    },
  });

  if (!poll) return null;

  const totalVotes = poll._count.votes;

  const options = poll.options.map((option) => {
    const voteCount = option._count.votes;

    const percentage =
      totalVotes === 0
        ? 0
        : Math.round((voteCount / totalVotes) * 10000) / 100;

    return {
      id: option.id,
      text: option.option_text,
      votes: voteCount,
      percentage,
    };
  });

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    status: poll.status,
    options,
    totalVotes,
    createdAt: poll.created_at,

    creator: {
      id: poll.creator_id,
      name: poll.creator?.name ?? "NA",
    },

    createdBy: poll.creator_id,
    isOwned: poll.creator_id === userId,

    hasVoted: poll.votes.length > 0,
    myVoteOptionId: poll.votes[0]?.option_id ?? null,
  };
}


export async function updatePoll(
  pollId: string,
  userId: string,
  input: UpdatePollInput
) {
  return prisma.$transaction(
    async (tx) => {
      // Lock the poll row to coordinate edits with voting operations.
      const lockedPoll = await tx.$queryRaw<{ id: string }[]>`
        SELECT id
        FROM polls
        WHERE id = ${pollId}
        FOR UPDATE
      `;

      if (lockedPoll.length === 0) {
        return { error: "NOT_FOUND" as const };
      }

      const poll = await tx.poll.findUnique({
        where: { id: pollId },
        select: {
          id: true,
          creator_id: true,
          status: true,
          _count: {
            select: { votes: true },
          },
        },
      });

      if (!poll || poll.status === "DELETED") {
        return { error: "NOT_FOUND" as const };
      }

      if (poll.creator_id !== userId) {
        return { error: "FORBIDDEN" as const };
      }

      if (poll.status !== "ACTIVE") {
        return { error: "NOT_EDITABLE" as const };
      }

      if (poll._count.votes > 0) {
        return { error: "VOTING_STARTED" as const };
      }

      await tx.poll.update({
        where: { id: pollId },
        data: {
          ...(input.title !== undefined && {
            title: input.title,
          }),

          ...(input.description !== undefined && {
            description: input.description || null,
          }),

          ...(input.options !== undefined && {
            options: {
              deleteMany: {},
              create: input.options.map((option) => ({
                option_text: option,
              })),
            },
          }),
        },
      });

      const updatedPoll = await tx.poll.findUniqueOrThrow({
        where: { id: pollId },
        select: {
          id: true,
          title: true,
          description: true,
          creator_id: true,
          created_at: true,
          status: true,
          options: {
            select: {
              id: true,
              option_text: true,
              _count: {
                select: { votes: true },
              },
            },
          },
          _count: {
            select: { votes: true },
          },
        },
      });

      return {
        poll: {
          id: updatedPoll.id,
          title: updatedPoll.title,
          description: updatedPoll.description,
          options: updatedPoll.options.map((option) => ({
            id: option.id,
            text: option.option_text,
            votes: option._count.votes,
          })),
          totalVotes: updatedPoll._count.votes,
          createdAt: updatedPoll.created_at,
          createdBy: updatedPoll.creator_id,
          isOwned: true,
          status: updatedPoll.status,
        },
      };
    },
    {
      maxWait: 5000,
      timeout: 10000,
    }
  );
}

export async function archivePoll(
  pollId: string,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const lockedPoll = await tx.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM polls
      WHERE id = ${pollId}
      FOR UPDATE
    `;

    if (lockedPoll.length === 0) {
      return { error: "NOT_FOUND" as const };
    }

    const poll = await tx.poll.findUnique({
      where: { id: pollId },
      select: {
        id: true,
        creator_id: true,
        status: true,
      },
    });

    if (!poll || poll.status === "DELETED") {
      return { error: "NOT_FOUND" as const };
    }

    if (poll.creator_id !== userId) {
      return { error: "FORBIDDEN" as const };
    }

    if (poll.status === "ARCHIVED") {
      return { error: "ALREADY_ARCHIVED" as const };
    }

    if (poll.status !== "ACTIVE" && poll.status !== "CLOSED") {
      return { error: "NOT_ARCHIVABLE" as const };
    }

    const archivedPoll = await tx.poll.update({
      where: { id: pollId },
      data: { status: "ARCHIVED" },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    return { poll: archivedPoll };
  });
}


export async function getPollResults(
  pollId: string,
  userId: string,
) {
  const poll = await prisma.poll.findFirst({
    where: {
      id: pollId,
      status: {
        not: "DELETED",
      },
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      created_at: true,
      creator_id: true,

      options: {
        select: {
          id: true,
          option_text: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      },

      _count: {
        select: {
          votes: true,
        },
      },

      votes: {
        where: {
          voter_id: userId,
        },
        select: {
          option_id: true,
        },
        take: 1,
      },
    },
  });

  if (!poll) {
    return null;
  }

  const totalVotes = poll._count.votes;

  const options = poll.options.map((option) => {
    const voteCount = option._count.votes;

    const percentage =
      totalVotes === 0
        ? 0
        : Math.round((voteCount / totalVotes) * 10000) / 100;

    return {
      id: option.id,
      text: option.option_text,
      votes: voteCount,
      percentage,
    };
  });

  return {
    id: poll.id,
    title: poll.title,
    description: poll.description,
    status: poll.status,
    createdAt: poll.created_at,
    createdBy: poll.creator_id,
    totalVotes,
    hasVoted: poll.votes.length > 0,
    myVoteOptionId: poll.votes[0]?.option_id ?? null,
    options,
  };
}