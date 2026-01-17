import React, { useState } from 'react';
import Papa from 'papaparse';
import { View, SavedVerse, BibleData } from '@/types';

interface ImportVersesProps {
    handleAddVerse: (selectedBook: string, startChapter: string, startVerse: string, endChapter: string | null, endVerse: string | null, silent: boolean) => 'duplicate' | 'added' | 'invalid';
    setView: (view: View) => void;
    savedVerses: SavedVerse[];
    bibleData: BibleData;
}

type ImportStatus = 'idle' | 'success' | 'error';
type SkippedVerse = { verse: string; reason: string };

export default function ImportVerses({ handleAddVerse, setView, bibleData }: ImportVersesProps) {
    const [error, setError] = useState('');
    const [skippedVerses, setSkippedVerses] = useState<SkippedVerse[]>([]);
    const [addedVerses, setAddedVerses] = useState<string[]>([]);
    const [importStatus, setImportStatus] = useState<ImportStatus>('idle'); // idle, success, error
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        
        setFileName(file.name);
        setImportStatus('idle');
        setError('');
        setSkippedVerses([]);
        setAddedVerses([]);

        Papa.parse<{ StartVerse: string; EndVerse?: string }>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<{ StartVerse: string; EndVerse?: string }>) => {
                const { data, meta } = results;
                if (!meta.fields?.includes('StartVerse') || !meta.fields.includes('EndVerse')) {
                    setError('Invalid CSV format. Please make sure the headers are "StartVerse" and "EndVerse".');
                    setImportStatus('error');
                    return;
                }

                const skipped: SkippedVerse[] = [];
                const added: string[] = [];
                data.forEach((row: { StartVerse: string; EndVerse?: string }) => {
                    const { StartVerse, EndVerse } = row;
                    const verseRange = EndVerse ? `${StartVerse}-${EndVerse}` : StartVerse;

                    if (!StartVerse) {
                        skipped.push({ verse: 'N/A', reason: 'StartVerse is empty.' });
                        return;
                    }

                    const verseRegex = /^((\d\s)?[a-zA-Z]+)\s(\d+):(\d+)$/;
                    if (!verseRegex.test(StartVerse) || (EndVerse && !verseRegex.test(EndVerse))) {
                        skipped.push({ verse: verseRange, reason: 'Invalid verse format. Please use "BOOK CHAPTER:VERSE".' });
                        return;
                    }

                    const startMatch = StartVerse.match(verseRegex);

                    if (!startMatch)
                        return;
                    const book = startMatch[1];
                    const chapter = startMatch[3];
                    const verse = startMatch[4];
                    
                    let endBook: string | null = null, endChapter: string | null = null, endVerseNum: string | null = null;
                    if (EndVerse) {
                        const endMatch = EndVerse.match(verseRegex);
                        if (!endMatch)
                            return;
                        endBook = endMatch[1];
                        endChapter = endMatch[3];
                        endVerseNum = endMatch[4];
                    }
                    
                    if(EndVerse && book !== endBook) {
                        skipped.push({ verse: verseRange, reason: 'Verses must be from the same book.' });
                        return;
                    }
                    
                    if(!bibleData[book] || !bibleData[book][chapter] || !bibleData[book][chapter][verse]) {
                        skipped.push({ verse: verseRange, reason: 'StartVerse is not a valid verse.' });
                        return;
                    }
                    
                    if(EndVerse && endBook && endChapter && endVerseNum && (!bibleData[endBook] || !bibleData[endBook][endChapter] || !bibleData[endBook][endChapter][endVerseNum])) {
                        skipped.push({ verse: verseRange, reason: 'EndVerse is not a valid verse.' });
                        return;
                    }

                    const result = handleAddVerse(book, chapter, verse, endChapter, endVerseNum, true);

                    if (result === 'duplicate') {
                        skipped.push({ verse: verseRange, reason: 'Duplicate verse.' });
                    } else if (result === 'added') {
                        added.push(verseRange);
                    }
                });

                setSkippedVerses(skipped);
                setAddedVerses(added);
                if (added.length > 0) {
                    setImportStatus('success');
                } else if (skipped.length > 0) {
                    setImportStatus('error');
                }
            },
            error: () => {
                setError('Error parsing CSV file.');
                setImportStatus('error');
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white text-black">
            <h1 className="text-4xl font-black mb-10 tracking-tighter text-center">Import Verses</h1>
            <div className="w-full max-w-lg text-center">
                <div className="mb-6 p-4 bg-gray-100 rounded">
                    <h2 className="text-lg font-bold mb-2">CSV Format Instructions</h2>
                    <p className="text-sm text-gray-700">
                        Please upload a .csv file with two columns: <strong>StartVerse</strong> and <strong>EndVerse</strong>.
                    </p>
                    <p className="text-sm text-gray-700 mt-2">
                        The verse format should be "BOOK CHAPTER:VERSE", for example, "Genesis 1:1".
                    </p>
                    <div className="mt-4 p-2 bg-white border rounded">
                        <pre className="text-xs text-left">
                            StartVerse,EndVerse<br/>
                            Genesis 1:1,Genesis 1:3<br/>
                            John 3:16,
                        </pre>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center">
                    <label htmlFor="csv-upload" className="btn btn-primary cursor-pointer">
                        Choose File
                    </label>
                    <input id="csv-upload" type="file" accept=".csv" onChange={handleFileUpload} data-testid="csv-upload" className="hidden"/>
                    <span className="mt-2 text-sm text-gray-500">{fileName || 'No file selected'}</span>
                </div>
                
                {importStatus === 'error' && error && <p className="mt-4 text-red-500">{error}</p>}
                
                {importStatus === 'success' && addedVerses.length > 0 && (
                    <div className="mt-4 p-4 bg-green-100 rounded">
                        <h3 className="font-bold text-green-800">Successfully imported:</h3>
                        <ul className="text-sm text-green-700 list-disc list-inside">
                            {addedVerses.map((verse, index) => (
                                <li key={index}>{verse}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {skippedVerses.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-100 rounded">
                        <h3 className="font-bold text-yellow-800">The following verses were skipped:</h3>
                        <ul className="text-sm text-yellow-700 list-disc list-inside">
                            {skippedVerses.map((skipped, index) => (
                                <li key={index}>{skipped.verse}: {skipped.reason}</li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <button onClick={() => setView('add-verse')} className="btn btn-secondary mt-8">
                    Back
                </button>
            </div>
        </div>
    );
}
