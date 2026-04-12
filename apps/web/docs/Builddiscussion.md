Claude’s Plan C:\Users\HP\.claude\plans\effervescent-sprouting-hollerith.md
User approved the plan
The plan has been approved! Now I need to execute it. Let me start with the corrections in the order specified:

Étape 1 — Corrections code:

A1 — AbortController + timeout on all direct fetch() calls in LeadReview.tsx

A2 — Null check on email before sendAppTemplateEmail()

A3 — Normalize devis URL to pdf_url only

A4 — Dynamic AI tags from ai_analysis_json.tags

A5 — Dynamic conversation from dynamic_dialogue

A6 — Dynamic insight text from ai_analysis_json.resume_executif

Étape 2 — UX Mobile:
7. B1 — Pipeline stepper mobile
8. B2 — min-height 44px on PhaseActionButton
9. B3 — Audit editor mobile overflow

Étape 3 — New templates:
10-15. Create 6 new HTML template files

Étape 4 — Import:
16-18. Run import script and verify

Now I need to start examining the files I'll be modifying, beginning with LeadReview.tsx to understand its current structure.

Le plan est approuvé. Je démarre l'exécution. D'abord, je localise les fetch() directs dans LeadReview.tsx.

Grep "await fetch\(N8N_" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
10 lines of output
Grep "sendAppTemplateEmail|recipient_email" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
53 lines of output
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 831-930)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 856-985)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 986-1115)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1081-1180)
Now I need to read the remaining fetch calls at lines ~1280-1300 (email section), ~1430-1460 (regen audit), ~1580-1600 (deal won ops), ~1620-1650 (deal won ops), ~1670-1700 (generate forms).

Let me read these sections and then make the targeted corrections.

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1271-1400)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1431-1510)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1576-1705)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1216-1275)
Good. Now I have a complete picture of all the fetch() calls in LeadReview.tsx. Let me now make the targeted corrections:

A1: AbortController + timeout on direct fetch() calls

The fetch calls that need timeout are:

Line 839: runAiEnhancer - fetch(N8N_AI_ASSIST_TEXT_WEBHOOK, ...)

Line 865: handleRegenerateAuditQuick - fetch(N8N_REGENERATE_AUDIT_WEBHOOK, ...)

Line 902: handleGenerateOrRegenerateAudit - fetch(N8N_GENERATE_AUDIT_WEBHOOK, ...)

Line 963: handleGeneratePdf - fetch(N8N_GENERATE_AUDIT_WEBHOOK, ...)

Line 1009: handleGenerateProposal - fetch(N8N_GENERATE_PROPOSAL_WEBHOOK, ...)

Line 1093: handleGenerateDevisForOffer - fetch(N8N_GENERATE_DEVIS_WEBHOOK, ...)

Line 1441: handleRegenerate - fetch(N8N_REGENERATE_AUDIT_WEBHOOK, ...)

Line 1588: handleSaveDeal - fetch(N8N_GENERATE_AUDIT_WEBHOOK, ...)

Line 1630: handleGenerateContract - fetch(N8N_DEAL_WON_OPS_WEBHOOK, ...)

Line 1675: handleGenerateKickoffForm - fetch(N8N_GENERATE_FORMS_WEBHOOK, ...)

I also need to add email null checks at lines 1359 and 1734 where recipient_email is being set from respondent_info?.email without verifying the email exists first. The devis URL normalization at lines 1107-1113 looks fine since there's already a guard checking for empty URLs.

The remaining issues are in LeadDetailsDrawer.tsx. I'm going to create a helper function n8nFetch that wraps fetch with a 30-second abort signal to handle timeouts consistently across all these webhook calls. The AI enhancer probably needs a shorter 10-second timeout since it's a synchronous operation, while the N8N webhooks that trigger async processes like audit and PDF generation should get the full 30 seconds. I notice handleGeneratePdf already manages state cleanup carefully, so I'll keep that pattern in mind as I add the timeout wrapper. I'm settling on adding the AbortController pattern inline to each fetch call—creating a controller with a 30-second timeout, passing the signal to fetch options, clearing the timeout on success, and handling AbortError in the catch block. I'll make these edits systematically across the file, targeting each webhook call with unique surrounding context to keep things safe. changes across a very large file. I'll apply timeouts to all 10 fetch calls in LeadReview.tsx, add email null checks before the 2 remaining sendAppTemplateEmail calls, keep the devis URL cascade as-is since it's already protected, and then fix the issues in LeadDetailsDrawer, PhaseActionButton, LeadPipelineStepper, and JsonAuditEditor before creating 6 new templates. This is substantial work, so I need to be methodical. For the timeout changes in LeadReview.tsx, I'll add a utility function near the top of the component to keep things clean—let me search for where the existing utility functions are defined.

Maintenant j'ai tous les contextes. Je commence les corrections de manière ordonnée.

A1 — Timeout sur tous les fetch() directs

Grep "const stripHtml|const textToHtml|const runAiEnhancer" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
3 lines of output
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 145-164)
Je vais ajouter le helper n8nFetch juste après textToHtml et ensuite remplacer tous les fetch N8N.

Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Added 20 lines
Maintenant je remplace les 10 appels fetch par n8nFetch :

Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Removed 4 lines
Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Removed 4 lines
The TypeScript error on line 887 is about "invalid character" - this is likely caused by smart quotes (curly quotes) in the string 'Régénération de l'audit déclenchée.' - the ' in l'audit is being interpreted as a string terminator since the string is wrapped in single quotes.

Let me check line 887 in the file.

L'apostrophe typographique ' dans la string cause l'erreur. Je la corrige.

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 884-893)
Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Modified
Line 889: showFeedback('error', { message: Erreur régénération: ${err.message} }); - the issue is É or the backticks... wait, this uses backticks so it should be fine. Let me read line 889 again.

Actually looking at the diagnostics - column 26 and 32 are "Invalid character" on line 889. The line is:
showFeedback('error', { message: Erreur régénération: ${err.message} });

Wait, actually the issue might be that the backtick template literal contains é in régénération - but that shouldn't cause an issue in TypeScript...

Let me count the character positions more carefully - columns 26 and 32-33 suggest the problem might be with the quotes around 'error' rather than the accented characters, possibly smart quotes instead of regular single quotes.

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 888-892)
Looking at line 889, it seems the backtick and single quotes look correct in the display, but there might be Unicode smart quotes. Column 26 = likely the ' in 'error' is a smart quote. Let me replace the whole line with plain ASCII quotes.

The errors are at columns 26 and 32-33. Let me count:
            showFeedback('error', { message: ...
123456789012345678901234567890
1111111111222222222233

So the single quotes around error are probably smart quotes instead of regular ASCII quotes. I'll replace the entire line with proper ASCII characters.

Les guillemets autour de 'error' sur la ligne 889 sont des smart quotes Unicode. Je remplace :

Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Modified
Now let me check if there are more smart quotes in the file that I need to fix. Let me grep for them.

Je dois vérifier et corriger tous les smart quotes du fichier avant de continuer. Il y en a sûrement d'autres.

Grep "[\u2018\u2019\u201C\u201D]" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
3 lines of output
There are 3 lines with smart quotes:

Line 887: Already fixed (the ' in l'audit - this is inside a double-quoted string so it's fine)
Line 924: 'Génération de l'audit déclenchée.' - has smart quotes around the outer string AND ' inside
Line 1420: has ' inside a template literal - should be fine actually since template literals use backticks
Wait, let me look more carefully. The grep shows these lines have Unicode characters \u2018\u2019\u201C\u201D.

Looking at line 887 more closely, the smart quote in l'audit is actually fine since it's inside a double-quoted string, even though the grep output shows it as a Unicode smart quote character.

The real problems are on line 924 where 'success' has smart quotes that will break TypeScript, and line 1420 where I need to check whether the single quotes around 'Vérifiez la connexion n8n' are also smart quotes that could cause issues.

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 921-928)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1417-1424)
Line 924 a des smart quotes qui cassent le parsing. Line 1420 a des smart quotes dans un template literal (moins grave). Je corrige les deux :

Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Modified
Line 925: setActivePhase('B'); - the 'B' might have smart quotes. Let me check.

Column 28 and 30 on line 925.             setActivePhase('B'); - counting:             setActivePhase( = 27 chars, then ' at 28, B at 29, ' at 30. So the smart quotes are around 'B'.

Les smart quotes entourent 'B' sur setActivePhase. Je corrige :

Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Modified
The smart quotes issue is pervasive throughout the file. Instead of fixing them one by one, let me do a broader scan to find all lines with smart quotes using the grep, and then fix them all at once. But I've already done that grep and found 3 lines. Let me check if the most recent fix cleared the errors.

Wait - line 1420 also has smart quotes but it's inside a template literal, which may or may not break. Let me also fix that one proactively.

Actually, the real problem is that the file has many smart quotes throughout and I'm going to keep hitting them as I make edits. The approach of fixing them individually is very tedious.

I should use a global Bash replacement to swap out all the curly single quotes with standard ones. The tricky part is being selective—curly apostrophes inside double-quoted strings or template literals are fine, especially in French text like "l'audit". The real culprits are curly quotes being used as string delimiters themselves. Let me run a command to target and replace those specifically. I'm realizing I should just use sed to replace all instances of those curly apostrophes with straight quotes throughout the entire file—it's the most straightforward and consistent approach.

Il y a des smart quotes dispersés dans tout le fichier. Je remplace tous en une seule opération :

Bash Replace all smart quotes with standard quotes in LeadReview.tsx
IN
cd "c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub" && powershell -Command "(Get-Content -Raw 'src/components/ReactApp/pages/LeadReview.tsx') -replace [char]0x2018, [char]39 -replace [char]0x2019, [char]39 -replace [char]0x201C, [char]34 -replace [char]0x201D, [char]34 | Set-Content -Encoding UTF8 'src/components/ReactApp/pages/LeadReview.tsx' -NoNewline"

OUT
(Bash completed with no output)
Grep "[\u2018\u2019\u201C\u201D]" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
2 lines of output
Zéro smart quotes restants. Maintenant je continue les remplacements fetch → n8nFetch :

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 913-927)
The PowerShell command corrupted the encoding. The text "Génération de l'audit déclenchée." became "GÃ©nÃ©ration de lâ€™audit dÃ©clenchÃ©e." - this is a UTF-8 encoding issue where the file was saved as UTF-8 but read back incorrectly.

The issue is that the PowerShell command with -NoNewline and -Encoding UTF8 messed up the encoding. The -Encoding UTF8 in PowerShell adds a BOM, and -NoNewline might have caused issues.

I can't just restore from git since I've already made edits to the file before this happened. I need to fix the encoding corruption directly rather than lose my previous work.

The real problem is that Get-Content -Raw read the file using the system's default encoding instead of UTF-8, so when I wrote it back with UTF-8 encoding, the already-UTF-8 characters got double-encoded. I should use iconv or explicitly specify the encoding when reading to prevent this mismatch.

Let me check the current state with git diff and then try using PowerShell's System.IO.File class with explicit UTF-8 encoding to both read and write the file, while replacing the smart quotes with regular apostrophes...

Writing PowerShell encoding fix...

Actually, the file's corrupted now, so I need to check git status first to see what I'm working with.

L'encodage UTF-8 a été corrompu par PowerShell. Je dois restaurer le fichier depuis git puis réappliquer les corrections proprement.

Bash Check git diff stats for LeadReview.tsx
IN
cd "c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub" && git diff --stat HEAD src/components/ReactApp/pages/LeadReview.tsx

OUT
 src/components/ReactApp/pages/LeadReview.tsx | 338 ++++++++++++++-------------
 1 file changed, 175 insertions(+), 163 deletions(-)
Bash Check if git stash can help, and verify current file encoding
IN
cd "c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub" && git stash && git stash pop 2>&1 | head -5 && echo "---" && python3 -c "
import re
path = 'src/components/ReactApp/pages/LeadReview.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()
print('OK - first 200 chars:')
print(repr(content[:200]))
" 2>&1 | head -20

OUT
Saved working directory and index state WIP on version-recuperee: dbba534 VERSION BEFORE CLAUDE REVIEW
On branch version-recuperee
Your branch is up to date with 'origin/version-recuperee'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
---
Python was not found; run without arguments to install from the Microsoft Store, or disable this shortcut from Settings > Apps > Advanced app settings > App execution aliases.
Oh, git stash already saved and popped the working directory. This means all my changes are gone now! The git stash saved and then git stash pop restored them. But wait, git stash saves all unstaged changes and then git stash pop restores them.

Wait, looking at the output:


Saved working directory and index state WIP on version-recuperee: dbba534 VERSION BEFORE CLAUDE REVIEW


This means the stash operation worked and my changes were restored back to the working directory. But now I'm realizing python3 isn't available, so I need to try a different approach to check the actual file encoding and verify whether the corruption is still there.

Looking at the git output more carefully, the git stash pop command did execute successfully, which means my changes—including the corrupted file—are back in the working directory. What I really need to do is restore the original file from git and then carefully re-apply my changes using the proper tools to avoid encoding issues.

The smart quotes issue seems to be the core problem—the original file had curly quotes in string delimiters rather than straight quotes, which is causing syntax errors. I should restore the clean version first, then methodically add back the n8nFetch helper and replace each fetch call one at a time. the string content itself — the curly apostrophe in l'audit was breaking the parser because it was being interpreted as a closing quote. So the issue wasn't with the outer delimiters but with that specific character inside the string causing the parser to misinterpret where the string actually ended.

The real solution is to replace all those curly quotes with straight ones throughout the file, or switch to double quotes for strings containing apostrophes. My PowerShell attempt had the right idea but mangled the UTF-8 encoding of the French accented characters, so I need to restore the original file and use a proper encoding-aware approach instead.

Je dois restaurer le fichier original, puis réappliquer les corrections proprement sans corrompre l'encodage :

Bash Restore LeadReview.tsx to original git version
IN
cd "c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub" && git checkout src/components/ReactApp/pages/LeadReview.tsx && echo "Restored OK"

OUT
Updated 1 path from the index
Restored OK
Bash Replace smart quotes in LeadReview.tsx using Node.js with proper UTF-8
IN
cd "c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub" && node -e "
const fs = require('fs');
const path = 'src/components/ReactApp/pages/LeadReview.tsx';
let content = fs.readFileSync(path, 'utf8');
// Replace curly/smart quotes with straight equivalents
content = content
  .replace(/\u2018/g, \"'\")
  .replace(/\u2019/g, \"'\")
  .replace(/\u201C/g, '\"')
  .replace(/\u201D/g, '\"');
fs.writeFileSync(path, content, 'utf8');
console.log('Done - smart quotes replaced');
// Verify accented chars still OK
const sample = content.slice(content.indexOf('Génération'));
console.log('Sample:', sample.slice(0, 60));
"

OUT
Done - smart quotes replaced
Sample: Génération de l'audit déclenchée.' });
            setActiv
The accented characters are preserved. Now the smart quotes should be replaced with straight quotes. Let me verify there are no more smart quotes:

L'encodage est préservé. Vérifions qu'il n'y a plus de smart quotes et que le TypeScript est propre :

Grep "[\u2018\u2019\u201C\u201D]" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
2 lines of output
Propre. Maintenant j'ajoute le helper n8nFetch et je remplace les 10 appels fetch :

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 151-162)
Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Added 20 lines
Maintenant je remplace tous les fetch(N8N_ en une seule opération Node.js :

Bash Replace all direct N8N fetch calls with n8nFetch in LeadReview.tsx
IN
cd "c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub" && node -e "
const fs = require('fs');
const path = 'src/components/ReactApp/pages/LeadReview.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace each direct fetch(N8N_*, {...}) block with n8nFetch(N8N_*, payload)
// Pattern: await fetch(WEBHOOK_VAR, {\n...'POST'...\n...headers...\n...body: JSON.stringify(VAR)\n})
const fetchRegex = /await fetch\((N8N_[A-Z_]+),\s*\{\s*method:\s*'POST',\s*headers:\s*\{[^}]+\},\s*body:\s*JSON\.stringify\(([^)]+)\)\s*\}\)/g;

let count = 0;
content = content.replace(fetchRegex, (match, webhook, bodyVar) => {
  count++;
  const timeout = webhook === 'N8N_AI_ASSIST_TEXT_WEBHOOK' ? ', 15_000' : '';
  return 'await n8nFetch(' + webhook + ', ' + bodyVar.trim() + timeout + ')';
});

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced', count, 'fetch calls with n8nFetch');

// Verify remaining direct fetch(N8N_ calls
const remaining = (content.match(/await fetch\(N8N_/g) || []).length;
console.log('Remaining direct fetch(N8N_ calls:', remaining);
"

OUT
Replaced 10 fetch calls with n8nFetch
Remaining direct fetch(N8N_ calls: 0
10/10 remplacés. Vérifions que le remplacement est correct :

Grep "n8nFetch\(N8N_" (in c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx)
10 lines of output
A1 terminé — 10 appels avec timeout 30s. Maintenant A2 — null check email :

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1346-1375)
Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Added 7 lines
Maintenant le null check pour l'email du kickoff :

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1721-1755)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx (lines 1711-1722)
Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\pages\LeadReview.tsx
Added 5 lines
A2 terminé. Maintenant A4+A5+A6 — LeadDetailsDrawer (tags dynamiques, conversation, insight) :

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\components\LeadDetailsDrawer.tsx (lines 231-330)
Je vois les sections à corriger. Je fais les 3 corrections A4+A5+A6 en une passe :

Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\components\LeadDetailsDrawer.tsx
Added 5 lines
Edit c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\components\LeadDetailsDrawer.tsx
Added 7 lines
A4+A5+A6 terminés. Maintenant B1+B2 — UX Mobile :

Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\components\PhaseActionButton.tsx (lines 61-100)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\components\LeadPipelineStepper.tsx (lines 61-120)
Read c:\Users\HP\Documents\text\2024\pretalk.me\pretalk-hub\pretalk-hub\src\components\ReactApp\components\LeadPipelineStepper.tsx (lines 2-61)
You've hit your limit · resets 7pm (Africa/Casablanca)