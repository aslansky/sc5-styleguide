var gulp = require('gulp'),
  chai = require('chai'),
  expect = chai.expect,
  fs = require('fs'),
  multiline = require('multiline'),
  kssSplitter = require('../lib/modules/kss-splitter');

describe('KSS divider', function() {

  it('should parse single KSS block', function() {
    var str = multiline(function() {
      /*
// Comment
// Styleguide 1.0

.a { b: c }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n// Styleguide 1.0\n'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should be agnostic to spaces in reference declaration', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n//Styleguide 1.0 \n'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should take multiline code', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }
$a: b;

.x { y: z }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n//Styleguide 1.0 \n'
        ],
        [
          'code',
          '.a { b: c }\n$a: b;\n\n.x { y: z }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should allow code blocks to have comments', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }

// Simple comment

.x { y: z }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n//Styleguide 1.0 \n'
        ],
        [
          'code',
          '.a { b: c }\n\n// Simple comment\n\n.x { y: z }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should parse several blocls', function(){
    var str = multiline(function() {
      /*
// Comment1
// Styleguide 1.0

.a { b: c }

// Comment2
// Styleguide 2.0

.x { y: z }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment1\n// Styleguide 1.0\n'
        ],
        [
          'code',
          '.a { b: c }\n\n'
        ]
      ],
      [
        'block',
        [
          'kss',
          '// Comment2\n// Styleguide 2.0\n'
        ],
        [
          'code',
          '.x { y: z }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should allow blocks with no code', function(){
    var str = multiline(function() {
      /*
// Comment1
// Styleguide 1.0

.a { b: c }

// Comment2
// Styleguide 2.0

// Comment3
// Styleguide 3.0

.x { y: z }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment1\n// Styleguide 1.0\n'
        ],
        [
          'code',
          '.a { b: c }\n\n'
        ]
      ],
      [
        'block',
        [
          'kss',
          '// Comment2\n// Styleguide 2.0\n'
        ],
        [
          'code',
          ''
        ]
      ],
      [
        'block',
        [
          'kss',
          '// Comment3\n// Styleguide 3.0\n'
        ],
        [
          'code',
          '.x { y: z }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should take any reference number', function(){
    var str = multiline(function() {
      /*
// Comment
// Styleguide 1

.a { b: c }

// Comment
// Styleguide 1.1

// Comment
// Styleguide 5.1.2.6
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n// Styleguide 1\n'
        ],
        [
          'code',
          '.a { b: c }\n\n'
        ]
      ],
      [
        'block',
        [
          'kss',
          '// Comment\n// Styleguide 1.1\n'
        ],
        [
          'code',
          ''
        ]
      ],
      [
        'block',
        [
          'kss',
          '// Comment\n// Styleguide 5.1.2.6'
        ],
        [
          'code',
          ''
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should ignore code before first KSS block', function() {
    var str = multiline(function() {
      /*
.x { y: x }

// Comment
// Styleguide 1.0

.a { b: c }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n// Styleguide 1.0\n'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should parse single KSS block in multiline comments', function() {
    var str = '' +
'/* Comment\n' +
'Styleguide 1.0\n' +
'*/\n' +
'\n' +
'.a { b: c }',
    result = [
      [
        'block',
        [
          'kss',
          '/* Comment\nStyleguide 1.0\n*/'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should parse multiline KSS with no ending linebreak', function() {
    var str = '' +
'/* Comment\n' +
'Styleguide 1.0    */' +
'\n' +
'.a { b: c }',
    result = [
      [
        'block',
        [
          'kss',
          '/* Comment\nStyleguide 1.0    */'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });
  it('should parse multiline KSS with string prefixes', function() {
    var str = '' +
'/* Comment\n' +
' * Styleguide 1.0\n' +
'*/' +
'\n' +
'.a { b: c }',
    result = [
      [
        'block',
        [
          'kss',
          '/* Comment\n * Styleguide 1.0\n*/'
        ],
        [
          'code',
          '.a { b: c }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

  it('should allow code blocks to have multiline comments', function(){
    var str = multiline(function() {
      /*
// Comment
//Styleguide 1.0 

.a { b: c }
      */}) +
'\n\n/* Simple comment */\n\n' +
multiline(function() {
    /*
.x { y: z }
      */
    }),
    result = [
      [
        'block',
        [
          'kss',
          '// Comment\n//Styleguide 1.0 \n'
        ],
        [
          'code',
          '.a { b: c }\n\n/* Simple comment */\n\n.x { y: z }'
        ]
      ]
    ],
    kssBlocks = kssSplitter.getAst(str);
    expect(kssBlocks).eql(result);
  });

});
