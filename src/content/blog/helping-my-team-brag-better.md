---
title: "Helping My Team Brag Better"
description: How a loose fortnightly working group, and a small GitHub template, got more of my team writing down their wins.
date: "2026/11/06"
imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
---

A few years back I kept seeing other engineers online talk about "brag docs". The idea is simple; you keep a running list of the things you've done at work (as well as outside of work, optionally - things like side projects), along with what came of them. They said it made performance reviews much easier, gives you a strong starting point for a resume when you're ready for your next role, and that it was a good way to share wins with the people around you.

Most of us are bad at this, especially as software development has gotten even more fast-paced the last few years. We finish something, move on to the next ticket, and six months later we can't remember what we did. That's a rough place to be when someone asks you to write a self-review, so I wanted to try it, and I wanted to try it with other people.

## A working group that stays loose

I work at [Alembic](https://alembic.com.au/), a fully remote company of about 16 people as of the time of writing. For over two years now, I've run a brag doc working group there, which meets once a fortnight for about an hour.

I run it loosely on purpose, and I don't tell anyone what their brag doc should look like. Some people want a tidy list, others want something messier, and I'd rather they build what works for them than copy mine. The session mostly functions as protected time, a reminder, once a fortnight, to open the doc and add things before they slip away.

People chat while they work, too. In a fully remote team, that turns out to matter a lot. It's one of the few places where we just hang out and get on with something quietly together.

## The part I didn't expect

After the first review cycle, a manager of one of my peers got in touch with me. They said the quality of self-reviews from people using brag docs had gone up dramatically.

That made sense once I thought about it. Managers don't need longer reviews, they need specific examples of where their reports had demonstrated responsibility and impact. People who had been keeping notes could point at real work and say how it measured up against our company rubric, which in turn made manager's lives easier by giving them evidence to score performance against. I was really glad to hear it, because it meant the doc was doing its job for both sides of the conversation.

## Moving from Notion to code

Most of us had been keeping our brag docs in Notion. We've talked as a company about eventually removing Notion, and I figured our docs shouldn't be stranded when that happens. Code is also a medium that engineers are comfortable in, so I built a [GitHub template repo](https://github.com/Theosaurus-Rex/brag-doc-template). Anyone can copy it with "Use this template".

It comes with a few Claude Code skills to take some of the effort out. One imports an existing Notion brag doc. One scans your recent GitHub, Linear and Slack activity for moments worth writing down. One flags entries that are still missing an outcome, because a brag without a result is only half a brag. The last one compiles a PDF for a date range, sorted against a rubric you provide - in Alembic's case, we have a set of guidelines for each engineer level that we are measured against each performance cycle, as well as stretch competencies. It's meant to help with self-reviews and with the manager's side of the review as well.

Anything private, like your rubric or real client and project names, lives in a gitignored folder, and a check stops sensitive content from leaking into the repo. It supports multiple roles and multiple companies, so it can be a long-term home for your achievements, not just something for one review cycle or one company. I kept it generic on purpose so the wider community can use it too.

## What happened next

Before the template, the group was small. Usually about three of us turned up, me included. Some people hadn't come because they couldn't be bothered, or they felt they didn't have the time, which is fair enough when you're encouraged to be 100% billable (we work at a consultancy).

Since the template launched, a few of those people have started showing up and using it. Now we get six or seven, depending on the week. For a company of 16, that's a big jump, and it's one of the nicest things I've seen come out of something I started on the side.

I don't think the tooling did that on its own. I think it removed enough friction that people were willing to give it a go, and then the protected time and each other did the rest.

## Try it yourself

If you've never kept a brag doc, I'd really recommend starting one. If you want a place to start, the [template is here](https://github.com/Theosaurus-Rex/brag-doc-template). And if you work with other people, consider starting a group around it. Keep it loose, put the time in the calendar, and let people do it their own way. You might be surprised who turns up.
