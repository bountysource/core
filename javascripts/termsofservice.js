with (scope('TermsofService', 'App')) {

  route('#termsofservice', function() {
    render(

      breadcrumbs(
        a({ href: '#' }, "BountySource"),
        "Terms of Service"
      ),

      h2({ style: 'text-align: center'}, "BountySource"),
      h2({ style: 'text-align: center'}, "Terms of Service"),
      
      p('THIS IS A LEGALLY BINDING AGREEMENT between you and BountySource ("', b('BountySource'), '", "', b('we'), '" or "', b('us'), '"). By using the BountySource.com website ("', b('Site'), '") or any of the BountySource services ("', b('Services'), '") means that you agree to all the terms and conditions of this Terms of Service ("', b('Agreement'), '"). If you are entering into this Agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these terms and conditions, in which case the terms "', b('you'), '" or "', b('your'), '" shall refer to such entity. If you do not have such authority, or if you do not agree with these terms and conditions, you must not proceed with the registration process or use our Site or Service.'),
      
      h1('1. Overview'),
      
      p('BountySource is a platform for encouraging open-open-sourcesource projects by enabling users to offer cash rewards for solutions to open-source issues posted on GitHub.com (“', b('GitHub'), '”).  BountySource is not affiliated with GitHub.'),
      
      ul(
          li('Any user can define an open-source coding issue (“', b('Issue'), '”) by posting an issue/feature on GitHub.com.'),
          li('Any user can post a cash bounty (“', b('Bounty'), '”) on BountySource to encourage development of a successful solution to an Issue posted on GitHub. These users are referred to as "', b('Backers'), '" in this Agreement.'),
          li('Any user can try and develop a solution to an Issue and win the Bounty. These users are referred to as "', b('Developers'), '" in this Agreement.'),
          li('Once Developers finish their solutions to an Issue (“', b('Solutions'), '”), they generate a pull request on GitHub. Persons authorized to merge pull requests on GitHub will decide whether a Solution is accepted or not.  BountySource will pay the Bounty to the Developer of the first Solution accepted on GitHub.'),
          li('Users that are authorized to merge pull requests on GitHub are referred to as "', b('Committers'), '" in this Agreement.')
        ),
        
      h1('2. Bounties'),
      
      p('2.1 Backers must provide their payment at the time they create a Bounty. Backers consent to BountySource and its payments partners charging their payment card or other payment method for the amount of the Bounty when it is created.'),
      p('2.2 Backers may increase the total Bounty (by creating another Bounty on the same Issue), but may not decrease or cancel their Bounty, after it has been created.'),
      p('2.3 Bounties have a default deadline of six months by which a Solution must be accepted (the “', b('Deadline'), '”).'),
      p('2.4 Backers will receive 100% of their Bounty back if no Solution is accepted by the Deadline. Bounties are nonrefundable if a Solution is accepted by the Deadline.'),
      p('2.5 BountySource will pay Bounties to the Developer whose Solution is accepted by the Deadline.'),
      p('2.6 Committers, Backers and Developers and other users should not take any action in reliance on having a successful Solution until the successful Solution has been accepted by a Committer on GitHub.'),
      p('2.7 Developers should not take any action in reliance on having a Bounty awarded until BountySource notifies them that they have the ability to withdraw and spend the money.'),
      p('2.8 Because of occasional failures of payments from Backers, BountySource cannot guarantee the full receipt of the Bounty amount pledged minus fees.'),
      p('2.9 BountySource and its payments partners will remove their fees before transmitting proceeds of a Bounty to Developers. Fees may vary depending on region and other factors.'),
      p('2.10 BountySource reserves the right to reject, cancel, interrupt, remove, or suspend a Bounty at any time and for any reason. BountySource is not liable for any damages as a result of any of those actions. BountySource\'s policy is not to comment on the reasons for any of those actions.'),
      
      h1('3. Solutions'),
      
      p('3.1 ', b('Submitting Solutions.'), ' Developers are responsible for submitting their proposed Solutions by properly submitting a pull request to the appropriate Issue on GitHub. BountySource does not receive, process or review proposed Solutions. If you are a Developer, you represent, warrant and promise that any Solution provided by you or on your behalf is an original creation of yours and does not, either directly or indirectly, infringe the intellectual property rights or other legal rights of any third party.'),
      p('3.2 ', b('Selection of Winning Solutions.'), ' The winning Solution will be selected by a Committer on GitHub by merging pull requests. The first merged pull request wins the Bounty. BountySource does not select winning Solutions. You agree not to make claims against BountySource or hold BountySource responsible in connection with the determination of the winning Solution.'),
      p('3.3 ', b('Intellectual Property Rights.'), ' BountySource is not the author or owner of any Solutions. BountySource does not guarantee or certify the open-source licensing availability of any Solutions. Solutions offered by Developers may be protected (in whole or in part) by copyrights, trademarks, service marks, patents, trade secrets, or other rights and laws. You shall abide by and maintain all copyright and other legal notices, information, and restrictions contained in any Solutions offered by Developers. You shall not sell, license, rent, or otherwise use or exploit any Solutions for commercial use or in any way that violates any third-party right, unless authorized to do so under the appropriate license.'),
      
      h1('4. Registration'),
      
      p('4.1 ', b('Registration Information.'), ' Developers and Backers must register with BountySource. If you are required to register, you must provide accurate, complete and current registration information and promptly correct and update your information while you have an account with BountySource. Your provision of inaccurate or unreliable information, your failure to promptly update information provided to BountySource, or your failure to respond for over 7 calendar days to inquiries by BountySource concerning the accuracy of contact details associated with your registration shall constitute a material breach of this Agreement and be a basis for termination of your account.'),
      p('4.2 ', b('Screen Name and Issue Names.'), ' You must not select a screen name or Issue name that (i) is the name of another person, with the intent to impersonate that person; (ii) is subject to any rights of another person, without appropriate authorization; or (iii) is otherwise offensive, vulgar, or obscene. BountySource reserves the right in its sole discretion to refuse registration of or cancel a screen name or Issue name.'),
      p('4.3 ', b('Account Activity.'), ' You are solely responsible for activity that occurs on your account and shall be responsible for maintaining the confidentiality of your password for the Site. You must never use another user account without the other user’s express permission. You will immediately notify BountySource in writing of any unauthorized use of your account, or other known account-related security breach.'),
      
      h1('5. Fees and Taxes'),
      
      p('5.1 ', b('Fees.'), ' Joining BountySource is free. However, to offset the costs of running the Service, we retain the interest earned while holding Bounties and a percentage of Bounties. When you contribute money towards a Bounty, you will have an opportunity to review the percentage withheld by BountySource.'),
      p('5.2 ', b('Taxes.'), ' You are responsible for all taxes associated with your use of BountySource.  If you are paid a Bounty, it is your responsibility to pay all income, VAT and other taxes due in connection with the payment. BountySource generally does not withhold amounts from Bounty payments unless required to do so by applicable law.'),
      
      h1('6. This Agreement'),
      
      p('6.1 ', b('Scope.'), ' This Agreement governs all users of the BountySource Service and Site, including, without limitation, Committers, Backers, Developers and anyone else who uses or browses the Service or Site. The Service is offered subject to acceptance of all of the terms and conditions contained in this Agreement, including the Privacy Policy available at www.bountysource.com/privacy, and all other operating rules, policies, and procedures that may be published on the Site by BountySource, which are incorporated by reference and may be updated by BountySource without notice to you. In addition, some Services offered through the Site may be subject to additional terms and conditions adopted by BountySource. Your use of those Services is subject to those additional terms and conditions, which are incorporated into this Agreement by this reference.'),
      p('6.2 ', b('Minimum Age.'), ' The Service is available only to individuals who are at least 18 years old. You represent and warrant that if you are an individual, you are at least 18 years old and of legal age to form a binding contract.'),
      p('6.3 ', b('Eligibility.'), ' BountySource may, in its sole discretion, refuse to offer the Service to any person or entity and change its eligibility criteria at any time. This provision is void where prohibited by law and the right to access the Service is revoked in those jurisdictions.'),
      p('6.4 ', b('Modifications.'), ' We reserve the right to amend the terms and conditions contained in this Agreement at any time by posting the amended Agreement in full to our Site without further notice. Changes will be effective immediately upon such posting, unless otherwise noted in the posting. We also reserve the right to change, suspend or discontinue the Site or Service (including, but not limited to, the availability of any feature, database or Solutions) at any time for any reason. BountySource may also impose limits on certain features and Services or restrict your access to parts or all of the Service without notice or liability. It is your responsibility to check this Agreement and our Site periodically for changes. Your continued use of the Service following the posting of any changes to this Agreement or our Site or Services constitutes acceptance of those changes.'),
      p('6.5 ', b('Termination.'), ' BountySource may terminate your access to the Service, without cause or notice, which may result in the forfeiture and destruction of all information associated with your account. If you wish to terminate your account, you may do so by following the instructions on the Site. Any fees paid to BountySource are non-refundable, except as otherwise expressly stated in this Agreement. All provisions of this Agreement that by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.'),
      
      h1('7. Rules and Conduct'),
      
      p('7.1 Your use of the Service must at all times be in good faith. You must not use the Service for any purpose that is prohibited by this Agreement. You shall abide by all applicable local, state, national, and international laws and regulations in your use of the Service, Site and Solutions.'),
      p('7.2 You are responsible for all of your account activity in connection with the Service. You shall not, and shall not permit any third party using your account to, take any action (including, without limitation, submitting a Solution) that:'),
      
      p({style: 'padding-left: 30px'}, '7.2.1 infringes any patent, trademark, trade secret, copyright, right of publicity, or other right of any other person or entity or violates any law or contract;'),
      p({style: 'padding-left: 30px'}, '7.2.2 is false, misleading or inaccurate;'),
      p({style: 'padding-left: 30px'}, '7.2.3 is unlawful, threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, tortious, obscene, offensive, profane or invasive of another\'s privacy;'),
      p({style: 'padding-left: 30px'}, '7.2.4 constitutes unsolicited or unauthorized advertising or promotional material or junk mail, spam or chain letters;'),
      p({style: 'padding-left: 30px'}, '7.2.5 contains software viruses or any other computer codes, files, or programs that are designed or intended to disrupt, damage, limit, or interfere with the proper function of any software, hardware, or telecommunications equipment or to damage or obtain unauthorized access to any system, data, password, or other information of BountySource or any third party;'),
      p({style: 'padding-left: 30px'}, '7.2.6 misrepresents or impersonates any person or entity, including any employee or representative of BountySource;'),
      p({style: 'padding-left: 30px'}, '7.2.7 imposes or may impose (as determined by BountySource in its sole discretion) an unreasonable or disproportionately large load on BountySource’s or its third-party providers’ infrastructure;'),
      p({style: 'padding-left: 30px'}, '7.2.8 interferes or attempts to interfere with the proper working of the Service or any activities conducted on the Service;'),
      p({style: 'padding-left: 30px'}, '7.2.9 bypasses any measures BountySource may use to prevent or restrict access to the Service (or other accounts, computer systems, or networks connected to the Service);'),
      p({style: 'padding-left: 30px'}, '7.2.10 runs Maillist, Listserv, or any form of auto-responder or "spam" on the Service;'),
      p({style: 'padding-left: 30px'}, '7.2.11 uses manual or automated software, devices, or other processes to "crawl" or "spider" any page of the Site;'),
      p({style: 'padding-left: 30px'}, '7.2.12 attempts to directly or indirectly (i) decipher, decompile, disassemble, reverse engineer, or otherwise attempt to derive any source code or underlying ideas or algorithms of any part of the Service, except to the limited extent applicable laws specifically prohibit such restriction; (ii) modify, translate, or otherwise create derivative works of any part of the Service; or (iii) copy, rent, lease, distribute, or otherwise transfer any of the rights that you receive hereunder.'),
      
      h1('8. Our Rights'),
      
      p('8.1 We reserve the right in our sole discretion to suspend, cancel or modify the Service or to cancel your participation in the Service at any time. If you are a Developer, this means that you may be prohibited from continuing development for an Issue, from submitting a Solution, or from being awarded a Bounty for a Solution.'),
      p('8.2 We reserve the right to disclose information about you or your registration or take other actions in our discretion:'),
      
      p({style: 'padding-left: 30px'}, '8.2.1 if required by law or government rules or requirements;'),
      p({style: 'padding-left: 30px'}, '8.2.2 to comply with any legal process served upon BountySource;'),
      p({style: 'padding-left: 30px'}, '8.2.3 if we believe it is necessary to avoid any financial loss or legal liability (whether civil or criminal) on the part of BountySource or any of its related companies and their directors, officers, employees and agents; or'),
      p({style: 'padding-left: 30px'}, '8.2.4 if deemed necessary at our sole discretion to protect the integrity of the Service or protect the rights and property of Bountysource or its officers, directors, employees affiliates or agents, our users and third parties.'),
      
      p('8.3 We may resolve or settle any and all third party claims, whether threatened or made, arising out of your registration or participation in an Issue.'),
      
      h1('9. Disclaimer'),
      
      p('TO THE FULLEST EXTENT PERMITTED BY LAW, BOUNTYSOURCE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SERVICE, SITE AND SOLUTIONS MADE AVAILABLE THROUGH THE SERVICE, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR PARTICULAR USE. THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE, AND ANY WARRANTIES IMPLIED BY ANY COURSE OF PERFORMANCE OR USAGE OF TRADE ARE EXPRESSLY DISCLAIMED. BOUNTYSOURCE, AND ITS DIRECTORS, EMPLOYEES, AGENTS, SUPPLIERS, PARTNERS, AND CONTENT PROVIDERS DO NOT WARRANT THAT: (A) THE SERVICE WILL BE SECURE OR AVAILABLE AT ANY PARTICULAR TIME OR LOCATION; (B) ANY DEFECTS OR ERRORS IN THE SERVICE OR SOLUTIONS WILL BE CORRECTED; (C) ANY SOLUTIONS OR SOFTWARE AVAILABLE AT OR THROUGH THE SERVICE IS FREE OF ERRORS, VIRUSES OR OTHER HARMFUL COMPONENTS; OR (D) THE RESULTS OF USING THE SERVICE OR SOLUTIONS WILL MEET YOUR REQUIREMENTS. YOUR USE OF THE SERVICE AND SOLUTIONS IS SOLELY AT YOUR OWN RISK. SOME STATES OR COUNTRIES DO NOT ALLOW LIMITATIONS ON HOW LONG AN IMPLIED WARRANTY LASTS, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. To the extent that such warranties cannot be disclaimed, you agree that the liability of BountySource shall be limited to re-supply of the Services.'),
      
      h1('10. Limitation of Liability'),
      
      p('IN NO EVENT SHALL BOUNTYSOURCE, ITS AFFILIATED COMPANIES OR THEIR RESPECTIVE DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, PARTNERS, SUPPLIERS, OR DEVELOPERS, BE LIABLE UNDER CONTRACT, TORT, STRICT LIABILITY, NEGLIGENCE, OR ANY OTHER LEGAL OR EQUITABLE THEORY WITH RESPECT TO THE SERVICE OR SOLUTIONS ENCOURAGED BY THE SERVICE (I) FOR ANY LOST PROFITS, DATA LOSS, COST OF PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES, OR SPECIAL, INDIRECT, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES OF ANY KIND WHATSOEVER, INCLUDING, WITHOUT LIMITATION, SUBSTITUTE GOODS OR SERVICES (HOWEVER ARISING), (II) FOR ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE (REGARDLESS OF THE SOURCE OF ORIGINATION), OR (III) FOR ANY DIRECT DAMAGES IN EXCESS OF (IN THE AGGREGATE) ONE HUNDRED U.S. DOLLARS ($100.00). SOME STATES OR COUNTRIES DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATIONS AND EXCLUSIONS MAY NOT APPLY TO YOU.'),
      
      h1('11. Indemnity'),
      
      p('You agree to indemnify, keep indemnified and forever hold harmless, BountySource and its related companies, and its and their directors, officers, employees and agents, from and against any and all claims, damages, liabilities, costs and expenses (including reasonable legal fees and expenses) arising out of or in connection with your use of the Service or any Solutions. BountySource reserves the right to assume the exclusive defense and control of any matter otherwise subject to indemnification by you, in which event you will assist and cooperate with BountySource in asserting any available defenses.'),
      
      h1('12. Third-Party Sites'),
      
      p('The Service and Site may link to other websites or resources on the Internet, and other websites or resources may contain links to the Site. When you access third-party websites, you do so at your own risk. Those other websites are not under BountySource\'s control, and you acknowledge that BountySource is not liable for the content, functions, accuracy, legality, appropriateness, or any other aspect of those other websites or resources. The inclusion on another website of any link to the Site does not imply endorsement by or affiliation with BountySource. You further acknowledge and agree that BountySource shall not be liable for any damage related to the use of any content, goods, or services available through any third-party website or resource.'),
      
      h1('13. Miscellaneous'),
      
      p('13.1 ', b('Severability.'), ' The terms of this Agreement are severable. If any term or provision is declared invalid or unenforceable, it shall be severed from this Agreement and shall not affect the interpretation or operation of the remaining terms or provisions, which shall remain in full force and effect.'),
      p('13.2 ', b('Entire Agreement.'), ' This Agreement, including the documents specifically incorporated by reference herein, constitutes the entire agreement between you and BountySource regarding the provision of the Services and supersedes all prior or contemporaneous agreements and understandings, whether established by custom, practice, policy or precedent.'),
      p('13.3 ', b('Governing Law.'), ' This Agreement (and any further rules, policies, or guidelines incorporated by reference) shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law, and without application of the Uniform Computer Information Transaction Act or the United Nations Convention of Controls for International Sale of Goods. You agree that BountySource and its Services are deemed a passive website that does not give rise to personal jurisdiction over BountySource or its parents, subsidiaries, affiliates, successors, assigns, employees, agents, directors, officers or shareholders, either specific or general, in any jurisdiction other than the State of California. You agree that any action at law or in equity arising out of or relating to these terms, or your use or non-use of the Services or Solutions, shall be filed only in the state or federal courts located in San Francisco County in the State of California and you hereby consent and submit to the personal jurisdiction of such courts for the purposes of litigating any such action. You hereby irrevocably waive any right you may have to trial by jury in any dispute, action, or proceeding.'),
      p('13.4 ', b('International.'), ' Accessing the Service is prohibited from territories where the Solutions or Service is illegal. If you access the Service from other locations, you do so at your own initiative and are responsible for compliance with local laws.'),
      p('13.5 ', b('Relationship.'), ' No agency, partnership, joint venture, or employment relationship is created as a result of this Agreement and neither party has any authority of any kind to bind the other in any respect. There are no intended third party beneficiaries of this Agreement.'),
      p('13.6 ', b('Force Majeure.'), ' BountySource shall not be liable for any failure to perform its obligations hereunder where the failure results from any cause beyond BountySource’s reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation.'),
      p('13.7 ', b('Assignment.'), ' This Agreement is personal to you, and are not assignable, transferable, or sublicensable by you except with BountySource\'s prior written consent. BountySource may assign, transfer, or delegate any of its rights and obligations hereunder without consent.'),
      p('13.8 ', b('Attorney Fees.'), ' In any action or proceeding to enforce rights under this Agreement, the prevailing party will be entitled to recover costs and attorneys\' fees.'),
      p('13.9 ', b('Waiver.'), ' Failure by BountySource to exercise or enforce any right or provision of this Agreement shall not be deemed to be a waiver of such right or provision and does not affect the right to require any provision to be performed at any time thereafter.'),
      p('13.10 ', b('Electronic Delivery, Notice Policy and Your Consent.'), ' By using the Services, you consent to receive from BountySource all communications including notices, agreements, legally required disclosures, or other information in connection with the Services (collectively, "', b('Contract Notices'), '") electronically. BountySource may provide the electronic Contract Notices by posting them on the Site. If you desire to withdraw your consent to receive Contract Notices electronically, you must discontinue your use of the Services.'),
      p('13.11 ', b('Electronic Communications Privacy Act Notice (18 USC §2701-2711).'), ' BOUNTYSOURCE MAKES NO GUARANTY OF CONFIDENTIALITY OR PRIVACY OF ANY COMMUNICATION OR INFORMATION TRANSMITTED ON THE SITE OR ANY WEBSITE LINKED TO THE SITE. BountySource will not be liable for the privacy of email addresses, registration and identification information, disk space, communications, confidential or trade-secret information, or any Solutions received by BountySource or stored on our equipment, transmitted over networks accessed by the Site, or otherwise connected with your use of the Service.'),
      
      p(i('Effective Date of Revision: October 19, 20Backer12'))
    );
  });
}