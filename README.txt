IAP GENERATOR — WEB / iPad VERSION
==================================

What is in this folder
  index.html             the IAP Generator (the same app as the single HTML file)
  sw.js                  keeps a copy on each device so it opens with no connection
  manifest.webmanifest   lets iPads add it to the Home Screen as an app
  icon-180.png / icon-192.png / icon-512.png   Home Screen icons

Keep all six files together in one folder on the web host.


1. PUT IT ON A WEB ADDRESS (once)
   Upload the whole folder to any host that serves files over https.
   It has to be https: browsers only allow offline mode on secure addresses.
   SharePoint and OneDrive will NOT work: they show HTML files as a preview
   without running them.

   Nothing in these files is incident data. Every IAP you build stays on the
   device it was built on, and in the .json files you save. The files do
   include the WWF radio frequency plan, so put them somewhere your unit is
   comfortable having that.


2. ON EACH iPad (once)
   - Open the address in Safari.
   - Wait for the toolbar pill to say "Offline ready" (a few seconds).
   - Tap Share, then "Add to Home Screen".
   From then on, open it from the Home Screen icon. It works with no
   connection.

   It opens in Tablet view on an iPad. The Tablet view / Switch to desktop
   view button (in the ... menu) changes this, and each device remembers its
   choice.


3. PUBLISHING AN UPDATE
   Replace index.html on the host with the new version. iPads keep using the
   copy they have until they are online and see the new one. The toolbar then
   says "Update ready - tap to reload". Work in progress is kept across the
   reload, but save first anyway.


GOOD HABITS ON AN iPad
   - Save the IAP to a file (Save button) at the end of each work session.
     The copy kept on the iPad itself is a convenience, not a backup. iPadOS
     can clear website data, for example when the iPad runs low on storage.
   - Check Print and Save on one iPad before relying on them. They were
     tested in Chrome emulating an iPad, not on a real iPad.


Toolbar status pill
   Preparing offline...      storing a copy on this device (first visit)
   Offline ready             a copy is stored; the app opens without a connection
   Offline                   no connection right now; everything still works
   Update ready - tap...     a newer version has been published; tap to load it
   (no pill)                 opened as a plain file; offline mode is not needed
