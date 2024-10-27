{
	"translatorID": "c0ec4cd0-1620-4242-8a5d-b14802f17c16",
	"label": "Cdiscount",
	"creator": "César Lizurey",
	"target": "^https?://(www\\.)?cdiscount\\.com",
	"minVersion": "5.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2024-10-27 15:16:36"
}

function detectWeb(doc, url) {
	// Check if the URL matches the desired format
	// var match = url.match(/^https:\/\/www\.fnac\.com\/a(\d+)\/([\w-]+)$/);
	var match = url.match(/^https:\/\/www\.cdiscount\.com\/[a-z-]+\/[a-z-]+\/[a-z0-9-]+\/f-\d+-\d+\.html.*$/);
	if (match) {
		Z.debug("URL OK");
		Z.debug(url);
		// Get the second <a> element in the breadcrumb to check the itemType
		var secondLink = doc.querySelector('nav.c-breadcrumb > ol.o-breadcrumb > li:nth-of-type(2)');
		Z.debug(secondLink);
		if (secondLink) {
			Z.debug("Breadcrumb OK");
			switch (secondLink.textContent.trim()) {
				case 'Librairie': {
					return 'book';
				}
				case 'Musique': {
					return 'audioRecording';
				}
				case 'DVD': {
					return 'videoRecording';
				}
				case 'Jeux vidéo': {
					return 'computerProgram';
				}
				default: {
					Z.debug("Unknown category '" + secondLink.textContent.trim() + "' will be ignored by Zotero");
					Z.debug("Items in this category will be ignored by Zotero: " + secondLink.textContent.trim());
					return false;
				}
			}
		}

		Z.debug("Breadcrumb KO");
		return false;
	}

	Z.debug("URL KO");
	return false;
}

function doWeb(doc, url) {
	Z.debug("Scraping from Page");
	var item = new Zotero.Item(detectWeb(doc, url) || "book");
	item.URL = url;
	item.creators = [];

	var characteristicsSection = doc.querySelector('ul#ProductSheetAccordion');
	if (characteristicsSection) {
		var characteristics = characteristicsSection.querySelectorAll('th');

		// Loop through all the characteristics
		for (var i = 0; i < characteristics.length; i++) {
			var characteristic = characteristics[i];
			var value = characteristic.nextElementSibling;
			const category = characteristic.textContent.trim();

			Z.debug(`${category}: ${value.textContent.trim()}`);

			switch (category) {
				case 'Titre principal': {
					// Extract the title
					item.title = value.textContent.trim();
					break;
				}
				case 'Titre du jeu': {
					// Extract the title
					item.title = value.textContent.trim();
					break;
				}
				case 'Titre': {
					// Extract the title
					item.title = value.textContent.trim();
					break;
				}
				case 'Catégorie(s)': {
					// Extract the title
					item.genre = value.textContent.trim();
					break;
				}
				case 'Auteur(s)': {
					// Extract the authors
					var authorElements = value.split(';');
					for (var j = 0; j < authorElements.length; j++) {
						item.creators.push({
							firstName: authorElements[j].textContent.split(',')[1].trim(),
							lastName: authorElements[j].textContent.split(',')[0].trim(),
							creatorType: "author"
						});
					}
					break;
				}
				case 'Traducteur': {
					// Extract the authors
					var translatorElements = value.split(';');
					for (var k = 0; k < authorElements.length; k++) {
						item.creators.push({
							firstName: translatorElements[k].textContent.trim(),
							lastName: "",
							creatorType: "translator"
						});
					}
					break;
				}
				case 'Date de parution': {
					// Extract the date
					let dateParution = value.textContent.trim();
					let dateParutionSplit = dateParution.split(' ');
					if (dateParutionSplit.length > 1) {
						// Define an object that maps French month names to month numbers
						var monthNames = {
							janvier: '01',
							février: '02',
							mars: '03',
							avril: '04',
							mai: '05',
							juin: '06',
							juillet: '07',
							août: '08',
							septembre: '09',
							octobre: '10',
							novembre: '11',
							décembre: '12'
						};
						// Loop through the keys in the monthNames object
						for (let element of dateParutionSplit) {
							for (let monthName in monthNames) {
								// Replace any occurrence of the key with the value, regardless of case
								element = element.replace(new RegExp(monthName, 'gi'), `${monthNames[monthName]}/`);
							}
						}
						dateParution = dateParutionSplit.join('/');
					}
					// Convert the date
					item.date = dateParution.split('/').reverse().join('-');
					break;
				}
				case 'Editeur': {
					// Extract the publisher, company of publisher depending on the itemType
					if (item.itemType === 'audioRecording') {
						item.label = value.textContent.trim();
					}
					else if (item.itemType === 'computerProgram') {
						item.company = value.textContent.trim();
					}
					else {
						item.publisher = value.textContent.trim();
					}
					break;
				}
				case 'ISBN': {
					// Extract the ISBN
					item.ISBN = value.textContent.trim();
					break;
				}
				case 'EAN': {
					// Extract the EAN as ISBN if ISBN is empty
					item.ISBN = item.ISBN || value.textContent.trim();
					break;
				}
				case 'Nombre de pages': {
					// Extract the number of pages
					item.numPages = +value.textContent.trim();
					break;
				}
				case 'Compositeur': {
					// Extract the composer
					item.composer = value.textContent.trim();
					break;
				}
				case 'Réalisateur': {
					// Extract the author
					item.creators.push({
						firstName: value.textContent.trim(),
						lastName: "",
						creatorType: "author"
					});
					break;
				}
			}
		}

		item.attachments = [
			{
				title: "Cdiscount.com Link",
				snapshot: false,
				mimeType: "text/html"
			}
		];
	}

	Z.debug("===== ITEM =====");
	Z.debug(item);
	Z.debug("===== END ITEM =====");
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"defer": true,
		"url": "https://www.cdiscount.com/livres-bd/livres-litterature/le-comte-de-monte-cristo-t-1/f-105020603-9782070405374.html",
		"items": [
			{
				"itemType": "book",
				"title": "Ajouter de la vie aux jours",
				"creators": [
					{
						"firstName": "Anne-Dauphine Julliand",
						"lastName": "",
						"creatorType": "author"
					}
				],
				"date": "2024-10-10",
				"ISBN": "1037510917",
				"URL": "https://www.fnac.com/a20666672/Anne-Dauphine-Julliand-Ajouter-de-la-vie-aux-jours",
				"libraryCatalog": "FNAC",
				"numPages": 137,
				"publisher": "Les Arenes Eds",
				"attachments": [
					{
						"title": "Fnac.com Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.fnac.com/a20601305/Auteur-A-Venir-Titre-a-venir",
		"items": [
			{
				"itemType": "book",
				"title": "Le Cours de Monsieur Paty",
				"creators": [
					{
						"firstName": "Mickaëlle Paty",
						"lastName": "",
						"creatorType": "author"
					},
					{
						"firstName": "Emilie Frèche",
						"lastName": "",
						"creatorType": "author"
					}
				],
				"date": "2024-10-16",
				"ISBN": "2226494855",
				"URL": "https://www.fnac.com/a20601305/Auteur-A-Venir-Titre-a-venir",
				"collection-title": "Temoignages",
				"libraryCatalog": "FNAC",
				"numPages": 208,
				"publisher": "Albin Michel",
				"attachments": [
					{
						"title": "Fnac.com Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.fnac.com/a20617198/Jerome-Rebotier-Le-Comte-de-Monte-Cristo-Vinyle-album",
		"items": [
			{
				"itemType": "audioRecording",
				"title": "Le Comte de Monte Cristo",
				"creators": [],
				"date": "2024-07",
				"ISBN": "0198028227711",
				"URL": "https://www.fnac.com/a20617198/Jerome-Rebotier-Le-Comte-de-Monte-Cristo-Vinyle-album",
				"composer": "Jérôme Rebotier",
				"label": "Masterworks",
				"libraryCatalog": "FNAC",
				"attachments": [
					{
						"title": "Fnac.com Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://www.fnac.com/a20917236/Horizon-Zero-Dawn-Remastered-PS5-Jeu-video-Playstation-5",
		"items": [
			{
				"itemType": "computerProgram",
				"title": "Horizon Zero Dawn Remastered PS5",
				"creators": [],
				"ISBN": "0711719592785",
				"URL": "https://www.fnac.com/a20917236/Horizon-Zero-Dawn-Remastered-PS5-Jeu-video-Playstation-5",
				"company": "Sony",
				"libraryCatalog": "FNAC",
				"attachments": [
					{
						"title": "Fnac.com Link",
						"snapshot": false,
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
