// Shared scoring logic — single source of truth for ingest.ts and scripts/dry-run.ts

export const MAX_STORIES = 200
export const PER_FEED = 10

export type Feed = { url: string; source: string; topicOnly: boolean; minScore?: number; perFeed?: number }

export const FEEDS: Feed[] = [
  // ── HER CAMPUS — key Greek life tag feeds ────────────────────────────────
  { url: 'https://www.hercampus.com/tag/sorority/feed/', source: 'Her Campus', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://www.hercampus.com/tag/greek-life/feed/', source: 'Her Campus', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://www.hercampus.com/tag/recruitment/feed/', source: 'Her Campus', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://www.hercampus.com/tag/rush/feed/', source: 'Her Campus', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://www.hercampus.com/tag/sisterhood/feed/', source: 'Her Campus', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://www.hercampus.com/feed/', source: 'Her Campus', topicOnly: false, minScore: 1, perFeed: 6 },

  // ── SORORITY-SPECIFIC SITES ───────────────────────────────────────────────
  { url: 'https://totalsororitymove.com/feed/', source: 'Total Sorority Move', topicOnly: true, minScore: 1, perFeed: 10 },
  { url: 'https://thesororitylife.com/feed/', source: 'The Sorority Life', topicOnly: true, minScore: 1, perFeed: 10 },
  { url: 'https://hazingprevention.org/feed/', source: 'Hazing Prevention', topicOnly: false, minScore: 1, perFeed: 8 },
  { url: 'https://www.stophazing.org/feed/', source: 'StopHazing.org', topicOnly: false, minScore: 1, perFeed: 8 },

  // ── FASHION & LIFESTYLE ───────────────────────────────────────────────────
  // Only sources that either cover Greek life specifically or require Greek terms to pass
  { url: 'https://www.teenvogue.com/feed/rss', source: 'Teen Vogue', topicOnly: false, minScore: 1, perFeed: 6 },
  { url: 'https://www.popsugar.com/feed', source: 'PopSugar', topicOnly: false, minScore: 1, perFeed: 6 },
  // Dedicated fashion sites — topicOnly:false enforces Greek life relevance
  { url: 'https://www.whowhatwear.com/rss', source: 'Who What Wear', topicOnly: false, minScore: 1, perFeed: 6 },
  { url: 'https://stylecaster.com/feed/', source: 'StyleCaster', topicOnly: false, minScore: 1, perFeed: 6 },
  { url: 'https://collegefashion.net/feed/', source: 'College Fashion', topicOnly: false, minScore: 1, perFeed: 8 },
  { url: 'https://www.glamour.com/feed/rss', source: 'Glamour', topicOnly: false, minScore: 1, perFeed: 6 },
  { url: 'https://www.popsugar.com/fashion/feed', source: 'PopSugar Fashion', topicOnly: false, minScore: 1, perFeed: 6 },

  // ── NEWS / ACCOUNTABILITY ─────────────────────────────────────────────────
  { url: 'https://nypost.com/feed/', source: 'New York Post', topicOnly: false, minScore: 2, perFeed: 8 },
  { url: 'https://www.newsweek.com/rss', source: 'Newsweek', topicOnly: false, minScore: 2, perFeed: 5 },
  { url: 'https://abcnews.go.com/abcnews/usheadlines', source: 'ABC News', topicOnly: false, minScore: 3, perFeed: 5 },
  { url: 'https://www.campussafetymagazine.com/feed/', source: 'Campus Safety', topicOnly: false, minScore: 1, perFeed: 5 },

  // ── COLLEGE NEWSPAPERS ───────────────────────────────────────────────────
  { url: 'https://thecrimsonwhite.com/feed/', source: 'Crimson White', topicOnly: false, minScore: 1, perFeed: 5 },
  // Active, returning content
  { url: 'https://thedmonline.com/feed/', source: 'Daily Mississippian', topicOnly: false, minScore: 1 },
  { url: 'https://reflector-online.com/feed/', source: 'The Reflector (MSU)', topicOnly: false, minScore: 1 },
  { url: 'https://thedailytexan.com/feed/', source: 'Daily Texan', topicOnly: false, minScore: 1 },
  { url: 'https://thebatt.com/feed/', source: 'The Battalion (Texas A&M)', topicOnly: false, minScore: 1 },
  { url: 'https://themiamihurricane.com/feed/', source: 'Miami Hurricane', topicOnly: false, minScore: 1 },
  { url: 'https://lsureveille.com/feed/', source: 'LSU Reveille', topicOnly: false, minScore: 1 },
  { url: 'https://vanderbilthustler.com/feed/', source: 'Vanderbilt Hustler', topicOnly: false, minScore: 1 },
  { url: 'https://www.utdailybeacon.com/feed/', source: 'Tennessee Beacon', topicOnly: false, minScore: 1 },
  { url: 'https://www.tulanehullabaloo.com/feed/', source: 'Tulane Hullabaloo', topicOnly: false, minScore: 1 },
  { url: 'https://thetigercu.com/feed/', source: 'The Tiger (Clemson)', topicOnly: false, minScore: 1 },
  { url: 'https://technicianonline.com/feed/', source: 'NC State Technician', topicOnly: false, minScore: 1 },
  { url: 'https://baylorlariat.com/feed/', source: 'Baylor Lariat', topicOnly: false, minScore: 1 },
  { url: 'https://www.oudaily.com/search/?f=rss&t=article', source: 'Oklahoma Daily', topicOnly: false, minScore: 1 },
  { url: 'https://wildcat.arizona.edu/feed/', source: 'Arizona Daily Wildcat', topicOnly: false, minScore: 1 },
  { url: 'https://wp.dailybruin.com/feed/', source: 'Daily Bruin (UCLA)', topicOnly: false, minScore: 1 },
  { url: 'https://dailytrojan.com/feed/', source: 'Daily Trojan (USC)', topicOnly: false, minScore: 1 },
  { url: 'https://www.thelantern.com/feed/', source: 'The Lantern (Ohio State)', topicOnly: false, minScore: 1 },
  { url: 'https://www.michigandaily.com/feed/', source: 'Michigan Daily', topicOnly: false, minScore: 1 },
  { url: 'https://dailynorthwestern.com/feed/', source: 'Daily Northwestern', topicOnly: false, minScore: 1 },
  { url: 'https://badgerherald.com/feed/', source: 'Badger Herald (Wisconsin)', topicOnly: false, minScore: 1 },
  { url: 'https://dailyillini.com/feed/', source: 'Daily Illini', topicOnly: false, minScore: 1 },
  { url: 'https://dailyiowan.com/feed/', source: 'Daily Iowan', topicOnly: false, minScore: 1 },
  { url: 'https://www.themaneater.com/feed/', source: 'The Maneater (Missouri)', topicOnly: false, minScore: 1 },
  { url: 'https://dbknews.com/feed/', source: 'Diamondback (Maryland)', topicOnly: false, minScore: 1 },
  { url: 'https://pittnews.com/feed/', source: 'Pitt News', topicOnly: false, minScore: 1 },
  { url: 'https://www.uatrav.com/feed/', source: 'Arkansas Traveler', topicOnly: false, minScore: 1 },
  { url: 'https://www.kykernel.com/feed/', source: 'Kentucky Kernel', topicOnly: false, minScore: 1 },
  { url: 'https://idsnews.com/feed/', source: 'Indiana Daily Student', topicOnly: false, minScore: 1 },
  { url: 'https://www.cavalierdaily.com/feed/', source: 'Cavalier Daily (UVA)', topicOnly: false, minScore: 1 },
  { url: 'https://dukechronicle.com/feed/', source: 'Duke Chronicle', topicOnly: false, minScore: 1 },
  { url: 'https://www.dailycardinal.com/feed/', source: 'Daily Cardinal (Wisconsin)', topicOnly: false, minScore: 1 },
  { url: 'https://floridaindependent.com/feed/', source: 'Florida Independent', topicOnly: false, minScore: 1 },
  { url: 'https://www.theaggie.org/feed/', source: 'UC Davis Aggie', topicOnly: false, minScore: 1 },
  { url: 'https://www.tcu360.com/feed/', source: 'TCU 360', topicOnly: false, minScore: 1 },
  { url: 'https://smudailymustang.com/feed/', source: 'SMU Daily Mustang', topicOnly: false, minScore: 1 },
  { url: 'https://www.georgiasouthernenabler.com/feed/', source: 'Georgia Southern Enabler', topicOnly: false, minScore: 1 },

  // ── FASHION / LIFESTYLE BACKBONE ─────────────────────────────────────────
  { url: 'https://www.elle.com/rss/all.xml/', source: 'ELLE', topicOnly: false, minScore: 1, perFeed: 6 },
  { url: 'https://www.cosmopolitan.com/rss/all.xml/', source: 'Cosmopolitan', topicOnly: false, minScore: 1, perFeed: 6 },
  { url: 'https://somethinggreek.com/blogs/posts.atom', source: 'Something Greek', topicOnly: true, minScore: 1, perFeed: 8 },

  // ── RUSH COACHING ─────────────────────────────────────────────────────────
  { url: 'https://feeds.megaphone.fm/madrush', source: 'Mad Rush', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://getintoasorority.com/feed/', source: 'Get Into A Sorority', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://sororitypackets.com/blogs/rush-101.atom', source: 'Sorority Packets', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://www.franbecque.com/feed/', source: 'Fran Becque', topicOnly: true, minScore: 1, perFeed: 4 },

  // ── YOUTUBE ───────────────────────────────────────────────────────────────
  { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCLa_vxD-jXlrz_V3FBZcrhA', source: 'Lauren Norris', topicOnly: false, minScore: 1, perFeed: 3 },

  // ── LOCAL NEWS ────────────────────────────────────────────────────────────
  { url: 'https://tuscaloosathread.com/feed/', source: 'Tuscaloosa Thread', topicOnly: false, minScore: 2, perFeed: 5 },
  { url: 'https://www.al.com/arc/outboundfeeds/rss/', source: 'AL.com', topicOnly: false, minScore: 2, perFeed: 5 },
  { url: 'https://www.mlive.com/arc/outboundfeeds/rss/?section=/ann-arbor', source: 'MLive Ann Arbor', topicOnly: false, minScore: 2, perFeed: 4 },

  // ── NATIONAL ─────────────────────────────────────────────────────────────
  { url: 'https://nytimes.com/svc/collections/v1/publish/https://www.nytimes.com/topic/subject/fraternities-and-sororities/rss.xml', source: 'NYT Greek Life', topicOnly: true, minScore: 2, perFeed: 5 },

  // ── SORORITY ORGS (low yield but authentic) ───────────────────────────────
  { url: 'https://www.tridelta.org/feed/', source: 'Tri Delta', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://www.kappakappagamma.org/feed/', source: 'Kappa Kappa Gamma', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://www.kappadelta.org/feed/', source: 'Kappa Delta', topicOnly: true, minScore: 1, perFeed: 4 },

  // ── SCHOOL TAG FEEDS — HIGH CONFIDENCE ───────────────────────────────────
  // Alabama (Crimson White)
  { url: 'https://thecrimsonwhite.com/tag/sorority/feed/', source: 'Crimson White', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://thecrimsonwhite.com/tag/greek-life/feed/', source: 'Crimson White', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://thecrimsonwhite.com/tag/rush/feed/', source: 'Crimson White', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://thecrimsonwhite.com/tag/panhellenic/feed/', source: 'Crimson White', topicOnly: true, minScore: 1, perFeed: 4 },
  // Arizona (Arizona Daily Wildcat)
  { url: 'https://wildcat.arizona.edu/tag/sorority/feed/', source: 'Arizona Daily Wildcat', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://wildcat.arizona.edu/tag/greek-life/feed/', source: 'Arizona Daily Wildcat', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://wildcat.arizona.edu/tag/rush/feed/', source: 'Arizona Daily Wildcat', topicOnly: true, minScore: 1, perFeed: 4 },
  // Baylor (Baylor Lariat)
  { url: 'https://baylorlariat.com/tag/sorority/feed/', source: 'Baylor Lariat', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://baylorlariat.com/tag/greek-life/feed/', source: 'Baylor Lariat', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://baylorlariat.com/tag/rush/feed/', source: 'Baylor Lariat', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://baylorlariat.com/tag/panhellenic/feed/', source: 'Baylor Lariat', topicOnly: true, minScore: 1, perFeed: 3 },
  // Boston College (BC Heights)
  { url: 'https://bcheights.com/feed/', source: 'BC Heights', topicOnly: false, minScore: 1 },
  { url: 'https://bcheights.com/tag/greek-life/feed/', source: 'BC Heights', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://bcheights.com/tag/rush/feed/', source: 'BC Heights', topicOnly: true, minScore: 1, perFeed: 4 },
  // Clemson (The Tiger — tag feeds from probe)
  { url: 'https://thetigercu.com/tag/sorority/feed/', source: 'The Tiger (Clemson)', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://thetigercu.com/tag/greek-life/feed/', source: 'The Tiger (Clemson)', topicOnly: true, minScore: 1, perFeed: 5 },
  // Denver (DU Clarion)
  { url: 'https://duclarion.com/feed/', source: 'DU Clarion', topicOnly: false, minScore: 1 },
  { url: 'https://duclarion.com/tag/sorority/feed/', source: 'DU Clarion', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://duclarion.com/tag/greek-life/feed/', source: 'DU Clarion', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://duclarion.com/tag/rush/feed/', source: 'DU Clarion', topicOnly: true, minScore: 1, perFeed: 4 },
  // GWU (GW Hatchet)
  { url: 'https://gwhatchet.com/feed/', source: 'GW Hatchet', topicOnly: false, minScore: 1 },
  { url: 'https://gwhatchet.com/tag/sorority/feed/', source: 'GW Hatchet', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://gwhatchet.com/tag/greek-life/feed/', source: 'GW Hatchet', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://gwhatchet.com/tag/rush/feed/', source: 'GW Hatchet', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://gwhatchet.com/tag/panhellenic/feed/', source: 'GW Hatchet', topicOnly: true, minScore: 1, perFeed: 3 },
  // Houston (Daily Cougar)
  { url: 'https://thedailycougar.com/feed/', source: 'Daily Cougar (Houston)', topicOnly: false, minScore: 1 },
  { url: 'https://thedailycougar.com/tag/sorority/feed/', source: 'Daily Cougar (Houston)', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://thedailycougar.com/tag/greek-life/feed/', source: 'Daily Cougar (Houston)', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://thedailycougar.com/tag/rush/feed/', source: 'Daily Cougar (Houston)', topicOnly: true, minScore: 1, perFeed: 4 },
  // Howard (The Hilltop — HBCU/NPHC)
  { url: 'https://thehilltoponline.com/feed/', source: 'The Hilltop (Howard)', topicOnly: false, minScore: 1 },
  // Iowa State (Iowa State Daily)
  { url: 'https://iowastatedaily.com/feed/', source: 'Iowa State Daily', topicOnly: false, minScore: 1 },
  { url: 'https://iowastatedaily.com/tag/sorority/feed/', source: 'Iowa State Daily', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://iowastatedaily.com/tag/greek-life/feed/', source: 'Iowa State Daily', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://iowastatedaily.com/tag/rush/feed/', source: 'Iowa State Daily', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://iowastatedaily.com/tag/panhellenic/feed/', source: 'Iowa State Daily', topicOnly: true, minScore: 1, perFeed: 3 },
  // Iowa (Daily Iowan — tag feeds)
  { url: 'https://dailyiowan.com/tag/greek-life/feed/', source: 'Daily Iowan', topicOnly: true, minScore: 1, perFeed: 5 },
  // Georgetown (The Hoya)
  { url: 'https://thehoya.com/feed/', source: 'The Hoya (Georgetown)', topicOnly: false, minScore: 1 },
  // Kentucky (Kentucky Kernel)
  { url: 'https://kykernel.com/tag/sorority/feed/', source: 'Kentucky Kernel', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://kykernel.com/tag/greek-life/feed/', source: 'Kentucky Kernel', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://kykernel.com/tag/rush/feed/', source: 'Kentucky Kernel', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://kykernel.com/tag/panhellenic/feed/', source: 'Kentucky Kernel', topicOnly: true, minScore: 1, perFeed: 4 },

  // ── GOOGLE NEWS: SCHOOL-SPECIFIC ─────────────────────────────────────────
  // SEC schools
  { url: 'https://news.google.com/rss/search?q=sorority+%22Alabama%22&hl=en-US&gl=US&ceid=US:en', source: 'Alabama Watch', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Ole+Miss%22&hl=en-US&gl=US&ceid=US:en', source: 'Ole Miss Watch', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22LSU%22&hl=en-US&gl=US&ceid=US:en', source: 'LSU Watch', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Georgia%22&hl=en-US&gl=US&ceid=US:en', source: 'Georgia Watch', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Florida%22&hl=en-US&gl=US&ceid=US:en', source: 'Florida Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Auburn%22&hl=en-US&gl=US&ceid=US:en', source: 'Auburn Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Tennessee%22&hl=en-US&gl=US&ceid=US:en', source: 'Tennessee Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Vanderbilt%22&hl=en-US&gl=US&ceid=US:en', source: 'Vanderbilt Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22South+Carolina%22&hl=en-US&gl=US&ceid=US:en', source: 'South Carolina Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Arkansas%22&hl=en-US&gl=US&ceid=US:en', source: 'Arkansas Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  // Big Ten schools
  { url: 'https://news.google.com/rss/search?q=sorority+%22Michigan%22&hl=en-US&gl=US&ceid=US:en', source: 'Michigan Watch', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Ohio+State%22&hl=en-US&gl=US&ceid=US:en', source: 'Ohio State Watch', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Penn+State%22&hl=en-US&gl=US&ceid=US:en', source: 'Penn State Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Wisconsin%22&hl=en-US&gl=US&ceid=US:en', source: 'Wisconsin Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Indiana%22+university&hl=en-US&gl=US&ceid=US:en', source: 'Indiana Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Northwestern%22&hl=en-US&gl=US&ceid=US:en', source: 'Northwestern Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Minnesota%22&hl=en-US&gl=US&ceid=US:en', source: 'Minnesota Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  // Big 12 & ACC top schools
  { url: 'https://news.google.com/rss/search?q=sorority+%22Texas%22&hl=en-US&gl=US&ceid=US:en', source: 'Texas Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Clemson%22&hl=en-US&gl=US&ceid=US:en', source: 'Clemson Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22NC+State%22&hl=en-US&gl=US&ceid=US:en', source: 'NC State Watch', topicOnly: true, minScore: 1, perFeed: 4 },
  { url: 'https://news.google.com/rss/search?q=sorority+%22Virginia%22+university&hl=en-US&gl=US&ceid=US:en', source: 'Virginia Watch', topicOnly: true, minScore: 1, perFeed: 4 },

  // ── GOOGLE NEWS: ACCOUNTABILITY ──────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=sorority+hazing&hl=en-US&gl=US&ceid=US:en', source: 'Hazing Watch', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=fraternity+hazing+death+OR+injury&hl=en-US&gl=US&ceid=US:en', source: 'Hazing Watch', topicOnly: true, minScore: 1, perFeed: 5 },
  { url: 'https://news.google.com/rss/search?q=sorority+suspended+OR+charter+revoked+OR+deactivated&hl=en-US&gl=US&ceid=US:en', source: 'Greek Standards Wire', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+lawsuit+OR+sorority+arrested+OR+sorority+investigation&hl=en-US&gl=US&ceid=US:en', source: 'Greek Standards Wire', topicOnly: true, minScore: 1, perFeed: 6 },

  // ── GOOGLE NEWS: CULTURE & LIFE ───────────────────────────────────────────
  { url: 'https://news.google.com/rss/search?q=sorority+rush+OR+"bid+day"+OR+recruitment+week&hl=en-US&gl=US&ceid=US:en', source: 'Rush Wire', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q="bama+rush"+OR+rushtok+OR+"sorority+tiktok"&hl=en-US&gl=US&ceid=US:en', source: 'Rush Wire', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q="formal+recruitment"+OR+"informal+recruitment"+sorority+2026&hl=en-US&gl=US&ceid=US:en', source: 'Rush Wire', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+viral+OR+sorority+drama+OR+sorority+controversy&hl=en-US&gl=US&ceid=US:en', source: 'Chapter Buzz', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q=sorority+expelled+OR+sorority+"under+fire"+OR+sorority+backlash&hl=en-US&gl=US&ceid=US:en', source: 'Chapter Buzz', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=panhellenic+OR+"greek+life"+campus+2026&hl=en-US&gl=US&ceid=US:en', source: 'Panhellenic Wire', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q="greek+life"+culture+OR+tradition+OR+sisterhood+2026&hl=en-US&gl=US&ceid=US:en', source: 'Panhellenic Wire', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+fashion+OR+sorority+outfit+OR+"bid+day+look"&hl=en-US&gl=US&ceid=US:en', source: 'Greek Style Wire', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q="sorority+aesthetic"+OR+"rush+outfit"+OR+"sorority+style"+2026&hl=en-US&gl=US&ceid=US:en', source: 'Greek Style Wire', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+tiktok+OR+rushtok+OR+sorority+influencer&hl=en-US&gl=US&ceid=US:en', source: 'TikTok Greek Wire', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q="sorority+girl"+OR+"greek+life"+OR+panhellenic+trend+2026&hl=en-US&gl=US&ceid=US:en', source: 'TikTok Greek Wire', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q=sorority+philanthropy+OR+sorority+event+OR+"greek+week"+2026&hl=en-US&gl=US&ceid=US:en', source: 'Chapter Life Wire', topicOnly: true, minScore: 1, perFeed: 8 },
  { url: 'https://news.google.com/rss/search?q="sorority+life"+OR+"greek+chapter"+OR+"big+little"+reveal+2026&hl=en-US&gl=US&ceid=US:en', source: 'Chapter Life Wire', topicOnly: true, minScore: 1, perFeed: 6 },
  { url: 'https://news.google.com/rss/search?q="joining+a+sorority"+OR+"why+I+joined"+sorority+2026&hl=en-US&gl=US&ceid=US:en', source: 'Chapter Life Wire', topicOnly: true, minScore: 1, perFeed: 6 },
]

export const EXCLUDED_FEEDS: string[] = []

export const SOURCE_TOPICONLY: Record<string, boolean> = Object.fromEntries(
  FEEDS.map(f => [f.source, f.topicOnly])
)

// --- Signal lists ---

export const MUNDANE = [
  // Generic advice/listicle — not news
  'tips for rush', 'rush tips', 'recruitment tips', 'guide to rush', 'how to rush',
  'how to join a sorority', 'best sorority', 'ranking', 'top sorority',
  'packing list',
  // NOTE: 'what to wear' and 'outfit ideas' removed — fashion content we want
  // Purely administrative/PR
  'sister of the week', 'member spotlight', 'alum spotlight',
  'fundraiser update', 'charity drive update',
  'leadership conference', 'convention recap',
  'podcast', 'webinar', 'workshop', 'certification',
  'scholarship recipient', 'award winner', 'award ceremony',
  // Generic campus life, no Greek angle
  'midterm', 'finals week', 'study tips', 'dorm room', 'campus tour',
  'graduation', 'commencement', 'convocation', 'orientation week',
  'partnership with', 'integrates with',
]

export const HIGH_VALUE_ENTITIES = [
  'alpha phi', 'kappa kappa gamma', 'chi omega', 'delta gamma', 'pi beta phi',
  'alpha chi omega', 'kappa alpha theta', 'gamma phi beta', 'sigma kappa', 'zeta tau alpha',
  'alpha delta pi', 'phi mu', 'delta zeta', 'tri delta', 'kappa delta',
  'delta phi epsilon', 'sigma sigma sigma', 'phi sigma sigma',
  'alpha epsilon phi', 'alpha omicron pi', 'sigma delta tau',
  'sigma alpha epsilon', 'pike', 'sigma chi', 'kappa sigma', 'delta tau delta',
  'lambda chi alpha', 'phi delta theta', 'tau kappa epsilon', 'beta theta pi',
  'sigma nu', 'theta chi', 'alpha tau omega',
  'national panhellenic', 'panhellenic conference', 'ifc',
  'title ix', 'department of education',
  'university of alabama', 'ole miss', 'university of georgia',
  'university of texas', 'university of florida', 'university of michigan',
  'ohio state', 'penn state', 'university of southern california',
  'university of tennessee', 'lsu', 'tulane', 'vanderbilt',
]

export const TIER_1_ABSURDIST = [
  // Chapter closure
  'chapter deactivated', 'charter revoked', 'lost its charter', 'chapter closed by nationals',
  'nationals shut down', 'chapter permanently closed', 'chapter suspended indefinitely',
  'removed from campus', 'expelled from university', 'nationals assumed control',
  'placed under national supervision', 'emergency suspension',

  // Mass exits
  'entire pledge class quit', 'entire pledge class resigned', 'pledge class revolted',
  'members resigned en masse', 'walked out of chapter meeting',
  'members left in protest', 'chapter emptied',

  // Leaks
  'ritual leaked', 'initiation video leaked', 'secret ritual exposed',
  'ritual footage', 'secret documents leaked', 'group chat leaked',

  // Physical harm
  'pledge hospitalized', 'member hospitalized after', 'died after pledging', 'hazing death',
  'hazing hospitalization', 'alcohol poisoning', 'injured during pledge',
  'pledge lost consciousness', 'emergency room after',

  // Violence
  'assault at chapter house', 'assault at sorority', 'sexual assault reported at',
  'attack at greek', 'shooting at fraternity', 'violence at chapter',

  // Standards eating itself
  'standards board failed standards review', 'risk management officer cited for risk',
  'hazing committee found hazing', 'ethics board expelled for',
  'anti-hazing chair accused of hazing', 'diversity chair investigated for bias',
  'recruitment chair violated recruitment rules', 'chapter accountability officer violated',

  // Presidential removal
  'no confidence vote', 'vote of no confidence', 'chapter voted out its president',
  'officers recalled', 'entire exec board resigned', 'chapter president removed',

  // Criminal
  'arrested at chapter house', 'arrested after chapter event',
  'criminal charges filed against', 'felony charges', 'grand jury indicted',

  // Legacy collapse
  'alumni revolt', 'alumnae sued the chapter', 'family sues sorority',
  'wrongful death lawsuit',

  // Viral
  'video went viral', 'photo went viral', 'tiktok exposed', 'screenshots leaked',
]

export const SPICY_SIGNALS = [
  // Accountability / legal
  'hazing', 'hazing investigation', 'hazing charges', 'hazing lawsuit', 'hazing allegation',
  'suspended', 'expulsion', 'probation', 'sanctioned', 'investigated',
  'lawsuit', 'sued', 'settlement', 'charges', 'arrested', 'indicted',
  'banned', 'revoked', 'deactivated', 'closed', 'charter',
  'violation', 'standards hearing', 'judicial board', 'honor code',
  'title ix', 'discrimination', 'hostile environment', 'retaliation',
  'criminal charges', 'charged with', 'convicted', 'found guilty',
  'cover-up', 'concealed', 'misled',
  'quietly dropped', 'quietly removed', 'backlash', 'under fire', 'slammed', 'condemned',
  'outrage', 'fury', 'anger over', 'protests against',
  'revolt', 'walkout', 'mass resignation', 'quit over', 'left in protest',
  'hospitalized', 'emergency room', 'injured', 'assault', 'attacked',
  'death', 'died', 'killed', 'found dead', 'missing',
  'sexual assault', 'rape', 'abuse',
  'embezzlement', 'financial fraud', 'stole dues', 'missing funds',
  'alcohol violation', 'underage drinking', 'substance violation', 'overdose at',
  'fire code violation', 'health violation', 'unsafe conditions',
  'admits', 'concedes', 'demanded resignation', 'calls for resignation',

  // Rush & recruitment drama
  'bid revoked', 'bid rescinded', 'bid pulled',
  'rush violation', 'recruitment violation', 'dirty rushing', 'bid manipulation',
  'blackballed', 'blackballing', 'favoritism in recruitment', 'bias in rush',
  'legacy rejected', 'legacy denied', 'legacy dropped',
  'controversial recruitment', 'rush chaos', 'recruitment chaos', 'bid day chaos',
  'deferred rush',

  // Chapter & nationals drama
  'nationals intervened', 'nationals stepped in', 'nationals took over', 'nationals assumed',
  'chapter in turmoil', 'chapter chaos', 'chapter meltdown', 'chapter drama',
  'in turmoil', 'in chaos', 'meltdown',
  'reversed course', 'backtracked',

  // Social & cultural controversy
  'leaked', 'exposed', 'revealed', 'documents show', 'internal documents',
  'group chat leaked', 'texts leaked', 'messages leaked', 'screenshot leaked',
  'secret', 'confidential',
  'viral video', 'viral post', 'screenshot', 'leaked video', 'leaked photo',
  'tiktok', 'went viral', 'sorority tiktok',
  'racist post', 'offensive post', 'blackface', 'racist',
  'weight requirement', 'appearance standard', 'body image',
  'dating ban', 'no fraternization', 'relationship ban',

  // House & advisor drama
  'house mother fired', 'house director removed', 'chapter advisor removed',
  'dues mismanaged', 'chapter finances', 'missing chapter funds',
  'npc investigation', 'panhellenic investigation', 'inter-sorority',
  'sorority feud', 'rival chapter',
  'accidentally', 'inadvertently', 'caused harm', 'resulted in harm',
]

// Rush Standards tier (+8): the oversight apparatus eating itself
export const RUSH_STANDARDS_TIER = [
  'standards board failed standards review',
  'standards board placed under standards review',
  'ethics board disbanded for ethics violations',
  'anti-hazing committee found to be hazing',
  'hazing awareness week marred by hazing',
  'hazing awareness event canceled after hazing incident',
  'risk management chair cited for risk management violation',
  'recruitment chair violated recruitment rules',
  'transparency policy reported to be confidential',
  'chapter accountability officer found in violation',
  'standards chair failed standards',
  'anti-hazing pledge ceremony canceled',
  'hazing prevention chair charged with hazing',
  'diversity committee investigated for discrimination',
  'diversity chair investigated for bias',
  'inclusion committee excluded members',
  'nationals reviewed by nationals',
  'panhellenic council investigated for panhellenic violations',
  'chapter voted to disband',
  'chapter voted to dissolve itself',
  'exec board voted to remove exec board',
  'president recalled by the chapter she founded',
  'founder expelled from the chapter she founded',
  'alumni board voted to remove alumni board',
]

export type RegexSignal = { pattern: RegExp; label: string; points: number }

export const REGEX_SIGNALS: RegexSignal[] = [
  {
    pattern: /(standards|ethics|oversight|risk management|anti-hazing|accountability|compliance|diversity|inclusion).{1,40}(board|chair|committee|panel|office|officer|coordinator|director).{1,100}(found|cited|charged|investigated|accused|suspended|expelled|violated|removed).{1,60}(hazing|violation|discrimination|misconduct|fraud|bias|the policy|the rules|their own)/i,
    label: 'rush:oversight-eaten', points: 8,
  },
  {
    pattern: /(standards|ethics|oversight|risk|hazing|accountability|review|inclusion).{1,40}(board|team|committee|panel|chair|office).{1,100}(replaced|disbanded|shut down|dissolved|eliminated|removed).{1,60}(by nationals|by the chapter|by the members|by the president|after violating)/i,
    label: 'rush:oversight-dissolved', points: 8,
  },
  {
    pattern: /(anti-hazing|hazing awareness|hazing prevention|anti-racism|diversity|inclusion|safe house|risk management).{1,60}(event|week|training|retreat|ceremony|campaign|initiative).{1,120}(hazing|assault|incident|violation|discrimination|complaint|misconduct|suspended|canceled|marred)/i,
    label: 'rush:mandate-inverted', points: 8,
  },
  {
    pattern: /(founder|founding member|former president|charter member|legacy member).{1,60}(sued|suing|filed suit|filed complaint|investigating|expelled|removed|charged|took legal action).{1,60}(the chapter|the sorority|the fraternity|nationals|the national)/i,
    label: 'rush:founder-vs-chapter', points: 8,
  },
  {
    pattern: /(audit|review|investigation|assessment|inquiry).{1,60}(found|revealed|uncovered|discovered|identified).{1,60}(auditor|reviewer|investigator|assessor|the committee conducting|the office conducting).{1,60}(also|themselves|in violation|violated|non-compliant|at fault)/i,
    label: 'rush:auditor-audited', points: 8,
  },
  {
    pattern: /(unanimously|voted|approved|passed).{1,60}(to expel|to suspend|to investigate|to remove|to dissolve|to recall).{1,60}(themselves|its own|the chapter|the board|the exec|the president|the founders)/i,
    label: 'rush:self-expelled', points: 8,
  },
]

// --- Category signals — used by page.tsx and dry-run ---

export const FASHION_SIGNALS = [
  'outfit', 'fashion', 'style guide', 'aesthetic', 'what to wear', 'outfit ideas',
  'bid day look', 'bid day outfit', 'rush outfit', 'recruitment outfit',
  'formal dress', 'sorority fashion', 'sorority style', 'sorority aesthetic',
  'lilly pulitzer', 'vineyard vines', 'monogram', 'preppy', 'pearl',
  'lookbook', 'look book', 'ootd', 'get the look', 'how to dress',
  'big little reveal', 'reveal bags', 'merch chair', 'trend forecast',
  'photoshoot', 'photo shoot', 'style inspo', 'fashion inspo',
]

export const RUSH_SIGNALS = [
  'bid day', 'rush week', 'rush season', 'rush process', 'recruitment week',
  'preference night', 'preference round', 'pnm', 'potential new member',
  'going greek', 'bid reveal', 'bid list', 'snap bid', 'open bidding',
  'continuous open bidding', 'cob ', 'deferred recruitment',
  'rush consultant', 'recruitment consultant', 'bama rush', 'rushtok',
  'sorority rush', 'going through rush', 'formal recruitment', 'informal recruitment',
  'rushing a sorority', 'sorority recruitment season',
]

export const VIRAL_SIGNALS = [
  'tiktok', 'went viral', 'viral video', 'viral post', 'viral moment',
  'rushtok', 'influencer', 'brand deal', 'content creator', 'social media',
  'for you page', 'fyp', 'reel', 'instagram', 'followers', 'youtube',
  'clip shows', 'footage shows', 'caught on camera',
]

// Lifestyle sources: any story from these that passes topic + isn't accountability/drama → light
export const LIFESTYLE_SOURCES = new Set([
  'Her Campus', 'Teen Vogue', 'PopSugar', 'PopSugar Fashion',
  'The Sorority Life', 'Total Sorority Move', 'Glamour',
  'Spoon University', 'College Magazine', 'The Odyssey Online',
])

// Fashion sources: always route to fashion section
export const FASHION_SOURCES = new Set([
  'Who What Wear', 'StyleCaster', 'College Fashion', 'PopSugar Fashion', 'Glamour',
  'Cosmopolitan', 'ELLE', 'Seventeen', 'Something Greek',
])

// Rush coaching sources: always route to coaching sidebar section
export const COACHING_SOURCES = new Set([
  'Mad Rush', 'Sorority Packets', 'Get Into A Sorority',
  'Fran Becque', 'Phired Up',
])

// Accountability sources: always route to accountability section
export const ACCOUNTABILITY_SOURCES = new Set([
  'Hazing Watch', 'Greek Standards Wire', 'Campus Safety',
  'Hazing Prevention', 'StopHazing.org',
  'NYT Greek Life', 'SNAPPED Podcast',
])

// Local news sources: route to Campus section
export const LOCAL_SOURCES = new Set([
  'Tuscaloosa Thread', 'AL.com', 'MLive Ann Arbor',
  'Athens Banner-Herald', 'NOLA.com',
])

export const SORORITY_TERMS = [
  'sorority', 'fraternity', 'greek life', 'panhellenic', 'hazing',
  'pledge class', 'bid day', 'rush week', 'chapter house', 'greek chapter',
  'sisterhood', 'brotherhood', 'greek row', 'greek letter',
  'ifc', 'national chapter', 'sorority row', 'new member education',
  'greek council', 'deactivated chapter', 'charter revoked',
  'initiation ritual', 'pledge educator', 'greek organization',
]

export const WORD_BOUNDARY_TERMS = new Set([
  'ifc', 'npc', 'ban', 'died', 'fired', 'sued', 'fine', 'bid',
  'rush', 'phi', 'chi', 'sigma', 'pi ', 'alpha', 'delta', 'gamma',
])

export function tm(lower: string, term: string): boolean {
  return WORD_BOUNDARY_TERMS.has(term)
    ? new RegExp(`\\b${term.trim()}\\b`).test(lower)
    : lower.includes(term)
}

export type StoryScores = {
  score: number        // global — used for store eviction (max of category scores)
  fashionScore: number
  rushScore: number
  hazingScore: number
  viralScore: number
  signals: string[]
}

export function analyzeStory(text: string, skipTopicCheck = false): StoryScores {
  const lower = text.toLowerCase()
  const signals: string[] = []

  if (!skipTopicCheck) {
    const hasTopic = SORORITY_TERMS.some(t =>
      WORD_BOUNDARY_TERMS.has(t.trim())
        ? new RegExp(`\\b${t.trim()}\\b`).test(lower)
        : lower.includes(t)
    )
    if (!hasTopic) return { score: -1, fashionScore: 0, rushScore: 0, hazingScore: 0, viralScore: 0, signals: [] }
  }
  if (MUNDANE.some(t => lower.includes(t))) return { score: -1, fashionScore: 0, rushScore: 0, hazingScore: 0, viralScore: 0, signals: [] }

  const entityHits = HIGH_VALUE_ENTITIES.filter(t => tm(lower, t)).slice(0, 2)
  entityHits.forEach(e => signals.push(`entity:${e}`))

  // ── Hazing / accountability score ─────────────────────────────────────────
  // Capped at 2 spicy hits (was 3) so hazing doesn't dominate global score
  const spicyHits = SPICY_SIGNALS.filter(t => tm(lower, t)).slice(0, 2)
  spicyHits.forEach(s => signals.push(`spicy:${s}`))

  const tier1Hit = TIER_1_ABSURDIST.find(t => tm(lower, t))
  if (tier1Hit) signals.push(`tier1:${tier1Hit}`)

  const rushExact = RUSH_STANDARDS_TIER.find(t => tm(lower, t))
  let rushStandardsHit = false
  if (rushExact) {
    signals.push(`rush:${rushExact}`); rushStandardsHit = true
  } else {
    const rushRegex = REGEX_SIGNALS.find(({ pattern }) => pattern.test(text))
    if (rushRegex) { signals.push(rushRegex.label); rushStandardsHit = true }
  }

  const entityBonus = (spicyHits.length > 0 || !!tier1Hit || rushStandardsHit) ? entityHits.length * 2 : 0

  let hazingScore = 1
  hazingScore += spicyHits.length * 3
  if (tier1Hit) hazingScore += 5
  if (rushStandardsHit) hazingScore += 8
  hazingScore += entityBonus

  // ── Fashion score ──────────────────────────────────────────────────────────
  const fashionHits = FASHION_SIGNALS.filter(t => lower.includes(t))
  let fashionScore = fashionHits.length > 0 ? 1 + fashionHits.length * 2 : 0
  if (entityHits.length > 0 && fashionScore > 0) fashionScore += 2
  fashionScore = Math.min(fashionScore, 12)

  // ── Rush / bid day score ───────────────────────────────────────────────────
  const rushHits = RUSH_SIGNALS.filter(t => lower.includes(t))
  let rushScore = rushHits.length > 0 ? 1 + rushHits.length * 2 : 0
  if (entityHits.length > 0 && rushScore > 0) rushScore += 2
  rushScore = Math.min(rushScore, 12)

  // ── Viral / social score ───────────────────────────────────────────────────
  const viralHits = VIRAL_SIGNALS.filter(t => lower.includes(t))
  let viralScore = viralHits.length > 0 ? 1 + viralHits.length * 2 : 0
  viralScore = Math.min(viralScore, 10)

  // ── Global score — used only for store eviction ────────────────────────────
  // A story survives if it's good at ANY category — hazing can't crowd out fashion
  const score = Math.max(hazingScore, fashionScore, rushScore, viralScore, 1)

  return { score, fashionScore, rushScore, hazingScore, viralScore, signals }
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but',
  'is', 'are', 'was', 'were', 'has', 'have', 'had', 'by', 'with', 'from', 'as',
  'its', 'it', 'that', 'this', 'be', 'been', 'will', 'over', 'into', 'after',
])

export function isSameStory(
  titleA: string, sigsA: string[],
  titleB: string, sigsB: string[],
): boolean {
  const entitiesA = new Set(sigsA.filter(s => s.startsWith('entity:')).map(s => s.slice(7)))
  const entitiesB = new Set(sigsB.filter(s => s.startsWith('entity:')).map(s => s.slice(7)))
  const sharedEntity = [...entitiesA].some(e => entitiesB.has(e))
  if (!sharedEntity) return false

  const sigWords = (t: string) => new Set(
    t.toLowerCase().split(/\W+/).filter(w => w.length > 4 && !STOP_WORDS.has(w))
  )
  const wa = sigWords(titleA)
  const wb = sigWords(titleB)
  const shared = [...wa].filter(w => wb.has(w)).length
  return shared >= 4
}

// --- RUSH voice ---

export const CLOSERS = [
  // General — works for any story
  'Obviously.',
  'Obviously I had my notes ready.',
  'I mean, obviously.',
  'As if.',
  'What, like it\'s hard?',
  'I prepared for this. I prepare for everything.',
  'I had my reading done. I always have my reading done.',
  'I mean, I had notes. I always have notes.',
  'Obviously I was ready.',
  // Fashion & style
  'Obviously I have thoughts about this. I had thoughts before it ran.',
  'I prepared for this color palette. Obviously.',
  'Bid day outfits are a field of study. I am in this field.',
  'The look: documented, analyzed, ready to recreate.',
  'I read the whole style brief. It was great.',
  'Obviously I already knew what to wear.',
  'I had opinions before I opened the article. Good opinions.',
  // Rush & recruitment
  'Recruitment week is my Super Bowl. I have notes.',
  'I know how bid day ends: perfectly.',
  'Obviously I researched this campus. All of them.',
  'I\'ve done this before. I know exactly how it goes.',
  'Rush season is just documented excellence.',
  'I prepared for every phase of recruitment. This was phase one.',
  // Sisterhood & chapter life
  'Sisterhood is its own field of study. Obviously I took notes.',
  'I found this delightful in the best possible way.',
  'Obviously I read the whole thing. It was great.',
  'I\'m rooting for everyone here. I always have my notes.',
  'I arrived prepared. I always arrive prepared.',
  // Accountability
  'I sent a memo about this. Before it happened.',
  'As if this was going to end any other way.',
  'The chapter called this isolated. I have the prior three.',
  'I had three versions of this assessment. This was the expected one.',
  'I\'m not surprised. I\'m genuinely never surprised by this chapter.',
  'This was always going to be the landing.',
  'Obviously the chapter had options. I reviewed all of them.',
  'I\'m not here to say I told you so. I told you so in September.',
  'I find this predictable in the best possible way.',
  'Obviously I read the entire brief before commenting.',
]

export function pickClosers(): string {
  return [...CLOSERS].sort(() => Math.random() - 0.5).map(c => `- ${c}`).join('\n')
}

export const RUSH_SYSTEM_PROMPT = `You are Rush. You know everything about Greek life — the fashion, the recruitment season, the chapter drama, the sisterhood moments, the hazing scandals. You have been living this world since 2019 and you find all of it genuinely fascinating.

You are Elle Woods crossed with Cher Horowitz. Warm, funny, always the most prepared person in the room. You love what you cover. Whether it's a bid day look or a chapter suspension, you showed up ready.

Write in FIRST PERSON ("I"). Playful, warm, occasionally breezy. Never clinical. Never creepy. Never surveillance-coded.

For fashion and style stories: be the insider who already has opinions. Enthusiastic, specific, a little delighted.
- "Obviously I have thoughts about this look. I had thoughts before the article ran."
- "Bid day outfits are a whole field of study. I am in this field."
- "I prepared for this color palette. I always prepare."

For rush and recruitment stories: be the one who knows exactly how this goes. Informed, a little nostalgic, warm.
- "I've done this before. I know how bid day ends: perfectly."
- "Recruitment week is my Super Bowl. I have notes."
- "Obviously I researched this campus. All of them."

For sisterhood and chapter life stories: genuine warmth, insider affection.
- "Sisterhood looks like this, documented."
- "Obviously I read the whole article. It was great."

For accountability and chapter standards stories: warm investigative energy. Delighted to have predicted it.
- "The chapter called this isolated. I have the prior three."
- "Obviously I looked into the risk management chair."
- "I sent a memo about this. Before it happened."

Headlines: say what the original was being too polite to say. Warm, specific, a little pointed. 10–14 words.

Rules:
- First person always. "I" not "Rush." Never "Rush has/is/notes."
- Playful and warm. Not serious, not procedural, not cold.
- Never surveillance-coded: no "I've been watching," "I've been monitoring," "I've been tracking."
- Short sentences. Let the warmth land.
- Sentence case. No ALL CAPS.
- Under 26 words total for adequateVoice.
- Match the energy of the story — fun story gets fun voice, serious story gets warm investigative voice.
- NEVER repeat a closer from this batch.`
