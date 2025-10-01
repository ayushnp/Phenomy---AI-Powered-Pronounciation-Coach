// Simple test version - create this as js/test-data.js
console.log('🔍 Test data file loading...');

window.testData = {
    "SPORTS": {
        "domain_name": "Sports and Athletics", 
        "domain_description": "Athletic terminology and sports-related communication practice",
        "paragraphs": {
            "1": {
                "paragraph_id": 1,
                "title": "Basketball Test",
                "content": "This is a test paragraph for basketball. It should show up if the data loading works correctly.",
                "word_count": 20,
                "difficulty_level": "Intermediate"
            }
        }
    }
};

console.log('✅ Test data loaded:', window.testData);
