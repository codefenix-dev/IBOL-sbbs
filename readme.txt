Inter BBS Oneliners (IBOL) for Synchronet
Version 0.260502

Initial version by Andrew Pamment (aka apam) (no version #)

Updates by Craig Hendricks (aka Codefenix) as of Version 0.1

ConstructiveChaos BBS:
  https://conchaos.synchro.net
 telnet://conchaos.synchro.net
    ssh://conchaos.synchro.net

===============================================================


What is IBOL?
---------------------------------------------------------------

This mod was designed to be compatible with the original
Inter BBS Onliners Mystic script. All oneliners that get
posted are distributed to other BBSes connected to fsxNet via
the FSX_DAT echo. 

In order for this mod to work, BBS membership in fsxNet is 
required, with the FSX_DAT InterBBS Data echo set up on the 
system. See the latest fsxNet infopack for setup information.



Setting up ibol.js
---------------------------------------------------------------

Important note:

This version of IBOL uses a slightly different method of keeping 
track of which messages haven been read. For this reason, if you 
are upgrading from any version prior to 0.250508, you must delete 
the following files from your /sbbs/xtrn/ibol path:

- ibol.lr
- ibol.msg

New files will be generated automatically the next time the
script runs.


Step 1. Create a new directory: /sbbs/xtrn/ibol

Step 2. Copy ibol.js and ibol.ini to the directory you just
        created.

Step 3. Modify ibol.ini and change the message base to the
        internal code of your FSX_DAT message area. Set the
        systemName value to how you want your system name to
        appear on the wall (pipe codes for color allowed). If
        this value is blank, the default is the system.name
        value.

Step 4. Add an External Program:
        
        +[|][?]-----------------------------------------------[< >]+
        |                   InterBBS One Liners                    |
        |----------------------------------------------------------|
        | |Name                       InterBBS One Liners          |
        | |Internal Code              IBOL                         |
        | |Start-up Directory         ../xtrn/ibol                 |
        | |Command Line               ?ibol                        |
        | |Clean-up Command Line                                   |
        | |Execution Cost             None                         |
        | |Access Requirements                                     |
        | |Execution Requirements                                  |
        | |Multiple Concurrent Users  Yes                          |
        | |I/O Method                 FOSSIL or UART               |
        | |Native Executable/Script   No                           |
        | |Use Shell or New Context   No                           |
        | |Modify User Data           No                           |
        | |Execute on Event           Logon    <--Optional         |
        +----------------------------------------------------------+

        Optional:
        
        If you'd like to display the InterBBS Last Callers during your
        logon events, set Execute on Event to "Logon".
        
        +[|][?]-----------------+ 
        | Execute as Event Only |     If you choose "Logon", answer "No" 
        |-----------------------|  <- to this prompt after choosing it,
        | |Yes                  |     otherwise your users won't be able 
        | |No   <- pick this    |     to run it from the External Programs
        +-----------------------+     menu.
        
Step 5. OPTIONAL: Edit the included "ibolhead.msg" file to your liking
        in PabloDraw. The script is flexible to accommodate headers of 
        any height, but 3 or 4 lines is recommended. If you'd like to 
        use the included "ibolhead-alt.msg" header instead, rename it 
        to "ibolhead.msg" and rename the original one "ibolhead.old" in 
        case you ever want to switch back.
        
Step 6. OPTIONAL BUT HIGHLY RECOMMENDED: To give your users the ability 
        to view the IBBS Wall with a scrolling interface, install the
        Scroller module (/sbbs/xtrn/scroller/scroller.js). If this script
        is present on your system, then your users will able to scroll
        the wall using the up, down, page up, page down, home, and end
        keys. It will load the wall file, starting at the bottom (newest
        posts).        
        
        If Scroller is not present, then Synchronet's standard console
        output with page pauses will be used by default.



Reset:
---------------------------------------------------------------

You can reset the wall at any time by deleting the "ibol.msg"
file. A new one will be generated automatically the next time
the script is run, starting with the next oneliner that gets
posted. If you want to also include all available previous
oneliners, also delete "ibol.lr".



Change log:
---------------------------------------------------------------

Version 0.261009 - Oct 9, 2026:

 > Prevent empty message bodies from other BBSes getting 
   written to ibol.msg. 


Version 0.260502 - May 2, 2026:

 > Twit list added. Twits have view-only access and allowed to 
   post anything. Thanks to xbit for the suggestion!
   
   
Version 0.250624 - June 24, 2025:

 > Control characters are now stripped out of messages before 
   they get posted to the wall. Likewise, control characters
   are stripped out of incoming messages from the data echo.
   This is to prevent messages containing potentially 
   malicious character sequences from getting displayed and
   spread through the network.


Version 0.250508 - May 8, 2025:

 > Changed the way messages in the data echo are kept track
   of in the ibol.lr file. Now it's just plain text instead
   of binary data.


Version 0.250413 - April 13, 2025:

 > Fixed an issue that would cause the .msg header file to not
   display after viewing the wall posts in Scroller.
 

Version 0.250322 - March 22, 2025:

 > Posts no longer get shown unless both the Author and Source 
   fields are populated. This fixes a nasty issue which prevented 
   the script from loading at all if posts from other BBSes 
   with bad or missing data got distributed through the echo.
 
 > Greatly enhanced the text-entry screen, showing a live preview
   of the text while typing it, accounting for pipe-color codes. 
   In addition, pipe-color codes no longer count toward the 
   overall length of the text to be posted.   
 
 > If the Scroller module is present on the system (in the path
   /sbbs/xtrn/scroller/scroller.js) it will be used used to view
   the previous IBOL wall posts. If it is not, then the plain
   console output will be used by default.
   
 > Viewable posts now fill the height of the screen.
 
 > Script is now more flexible with header msg files of varying
   heights.
   
 > Simplified the logic for enforcing maximum left-padded BBS 
   name lengths.
   
 > Changed version number scheme (just easier for me to follow).
 

Version 0.1 - December 20, 2023:

 > CTRL-A codes now formatted as \x01.
 
 > ibol.asc renamed to ibol.msg.

 > Pipe codes get converted to Synchronet's Ctrl-A codes
   before getting stored in the ibol.msg file.

 > Added logic to keep the displayed length of system names
   to 20 characters, regardless of whether or not they contain
   pipe codes. Previously, if a sysop chose to include pipe
   code colors in the system name, they would be counted
   toward the total length of the string, leading to
   unexpected results when displayed.

 > Added "systemName" setting. This lets a sysop configure a
   custom display name (e.g.: using pipe codes, etc) for their
   system. Defaults to system.name if left blank.

 > Added a DELAY to the presentation for an animated effect.
 
 > The header is now read from an external file, instead of
   hard-coded.
   
 > Prompt the user with Yes/No confirmation before posting the
   one-liner.
   
 > The wall gets read back to the user after they post a new
   one-liner (visual feedback).


Initial Version - December 3, 2018

 > Read and post messages to FSX_DAT message base.



Final words...
---------------------------------------------------------------

I found this mod floating around the nets uncredited. I liked
the idea of an inter-BBS oneliner that exchanged posts via FTN
messaging, because it doesn't require a live connection to
another service or someone else's BBS in order to work; it
simply reads from the existing message base on the system, and
then any one-liners anyone posts get distributed through the
network during polls.

I tried it out, and saw that it worked nicely, however I
wanted to try to add onto it. I eventually found out that the
author of ibol for Synchronet was none other than Apam, author
of Talisman BBS and doors such as For Honour. I reached out to
him and he gave me his blessing to take the project over.

If you have questions, feel to send me netmail and I will do 
my best to answer.

  fsxNet ..... Craig Hendricks@21:4/141

One last note. Even though this is a "One-Liner" mod, it seems
as though it's designed to take up to 10 lines of input from
the user. I don't understand the reason for this (shrugs). :P

Enjoy! I hope other Synchronet sysops find this mod as useful 
as I have.

