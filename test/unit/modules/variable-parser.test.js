var requireModule = require('requirefrom')('lib/modules'),
    chai = require('chai'),
    expect = chai.expect,
    multiline = require('multiline'),
    parser = requireModule('variable-parser');

describe('Parser', function() {
  describe('variable finding', function() {
    describe('SCSS syntax', function() {
      it('should return all used variables', function() {
        var str = multiline(function() {
          /*
          color: $mycolor1;
          .testStyle {
            border: 1px solid $mycolor2;
          }
          .testStyle2 {
            background-color: $mycolor3;
          }
          */
        }),
        result = ['mycolor1', 'mycolor2', 'mycolor3'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should not return new variable definitions', function() {
        var str = multiline(function() {
          /*
          $mycolor: #00ff00;
          .testStyle {
            color: $mycolor2;
          }
          */
        }),
        result = ['mycolor2'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should find variables that are used as function arguments', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: rgba($mycolor, $myopacity);
          }
          */
        }),
        result = ['mycolor', 'myopacity'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should not find variables from variable declarations', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            $sum: $var1 + var2;
            padding: $sum;
          }
          */
        }),
        result = ['sum'];
        expect(parser.findVariables(str)).eql(result);
      });

      it('should find variables that have double parenthesis', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            padding: ceil(($myvar));
          }
          */
        }),
        result = ['myvar'];
        expect(parser.findVariables(str)).eql(result);
      });
    });

    describe('LESS syntax', function() {
      it('should return all used variables', function() {
        var str = multiline(function() {
          /*
          color: @mycolor1;
          .testStyle {
            border: 1px solid @mycolor2;
          }
          .testStyle2 {
            background-color: @mycolor3;
          }
          */
        }),
        result = ['mycolor1', 'mycolor2', 'mycolor3'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

      it('should not return new variable definitions', function() {
        var str = multiline(function() {
          /*
          @mycolor: #00ff00;
          .testStyle {
            color: @mycolor2;
          }
          */
        }),
        result = ['mycolor2'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

      it('should find variables that are used as function arguments', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            color: rgba(@mycolor, @myopacity);
          }
          */
        }),
        result = ['mycolor', 'myopacity'];
        expect(parser.findVariables(str, 'less')).eql(result);
      });

      it('should not find variables from variable declarations', function() {
        var str = multiline(function() {
          /*
          .testStyle {
            $sum: @var1 + @var2;
            padding: @sum;
          }
          */
        }),
        result = ['sum'];
        expect(parser.findVariables(str)).eql(result);
      });
    });
  });

  describe('variable parser', function() {
    describe('SCSS syntax', function() {
      it('should parse basic variables', function() {
        var str = multiline(function() {
          /*
          $mycolor: #00ff00;
          $mypadding: 3px;
          $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariables(str)).eql(result);
      });

      it('should parse variables from file with containing comments and intended lines', function() {
        var str = multiline(function() {
          /*
          $mycolor: #00ff00;
          // Test comment
          $mypadding: 3px; // Test comment 2
          $myfont: "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariables(str)).eql(result);
      });

      it('should parse variables correct when there are multiple variables in a single line', function() {
        var str = '$color1: #ff0000; $color2: #00ff00; $color3: #0000ff;',
          result = [
            {name: 'color1', value: '#ff0000'},
            {name: 'color2', value: '#00ff00'},
            {name: 'color3', value: '#0000ff'}
          ];
        expect(parser.parseVariables(str)).eql(result);
      });

      it('should not take commented variables', function() {
        var str = multiline(function() {
          /*
          $color1: #ff0000;
          // $color2: #00ff00;
          $color3: #0000ff;
          // $color4: #0f0f0f;
          */
        }),
        result = [
          {name: 'color1', value: '#ff0000'},
          {name: 'color3', value: '#0000ff'}
        ];
        expect(parser.parseVariables(str)).eql(result);
      });
    });

    describe('LESS syntax', function() {
      it('should parse basic variables', function() {
        var str = multiline(function() {
          /*
          @mycolor: #00ff00;
          @mypadding: 3px;
          @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariables(str, 'less')).eql(result);
      });

      it('should parse variables from file with containing comments and intended lines', function() {
        var str = multiline(function() {
          /*
          @mycolor: #00ff00;
          // Test comment
            @mypadding: 3px; // Test comment 2
          @myfont: "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        result = [
          {name: 'mycolor', value: '#00ff00'},
          {name: 'mypadding', value: '3px'},
          {name: 'myfont', value: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
        ];
        expect(parser.parseVariables(str, 'less')).eql(result);
      });

      it('should parse variables correct when there are multiple variables in a single line', function() {
        var str = '@color1: #ff0000; @color2: #00ff00; @color3: #0000ff;',
          result = [
            {name: 'color1', value: '#ff0000'},
            {name: 'color2', value: '#00ff00'},
            {name: 'color3', value: '#0000ff'}
          ];
        expect(parser.parseVariables(str, 'less')).eql(result);
      });

      it('should not take commented variables', function() {
        var str = multiline(function() {
          /*
          @color1: #ff0000;
          // @color2: #00ff00;
          @color3: #0000ff;
          // @color4: #0f0f0f;
          */
        }),
        result = [
          {name: 'color1', value: '#ff0000'},
          {name: 'color3', value: '#0000ff'}
        ];
        expect(parser.parseVariables(str, 'less')).eql(result);
      });
    });
  });

  describe('variable setter', function() {
    describe('SCSS syntax', function() {
      it('should change single value variable', function() {
        var str = multiline(function() {
          /*
  $mycolor: #00ff00;
  $mypadding: 3px;
  $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = [
          {name: 'mycolor', value: '#0000ff'},
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*
  $mycolor: #0000ff;
  $mypadding: 5px;
  $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });

      it('should change complex value variable', function() {
        var str = multiline(function() {
          /*
  $mycolor: #00ff00;
  $mypadding: 3px;
  $myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = [
          {name: 'myfont', value: '"Helvetica Neue", Tahoma'}
        ],
        result = multiline(function() {
          /*
  $mycolor: #00ff00;
  $mypadding: 3px;
  $myfont:   "Helvetica Neue", Tahoma;
          */
        }),
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });
      it('should preserve indents', function() {
        var str = multiline(function() {
          /*

    $mycolor: #00ff00;
  $mypadding:   3px;
          */
        }),
        variables = [
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*

    $mycolor: #00ff00;
  $mypadding:   5px;
          */
        }),
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });
      it('should preserve comments', function() {
        var str = '' +
          '$mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '$mypadding: 3px;',
        variables = [
          {name: 'mypadding', value: '0'}
        ],
        result = '' +
          '$mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '$mypadding: 0;',
        changed = parser.setVariables(str, 'scss', variables);
        expect(changed).eql(result);
      });
    });
    describe('LESS syntax', function() {
      it('should change single value variable', function() {
        var str = multiline(function() {
          /*
  @mycolor: #00ff00;
  @mypadding: 3px;
  @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = [
          {name: 'mycolor', value: '#0000ff'},
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*
  @mycolor: #0000ff;
  @mypadding: 5px;
  @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });

      it('should change complex value variable', function() {
        var str = multiline(function() {
          /*
  @mycolor: #00ff00;
  @mypadding: 3px;
  @myfont:   "Helvetica Neue", Helvetica, Arial, sans-serif;
          */
        }),
        variables = [
          {name: 'myfont', value: '"Helvetica Neue", Tahoma'}
        ],
        result = multiline(function() {
          /*
  @mycolor: #00ff00;
  @mypadding: 3px;
  @myfont:   "Helvetica Neue", Tahoma;
          */
        }),
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });
      it('should preserve indents', function() {
        var str = multiline(function() {
          /*

    @mycolor: #00ff00;

  @mypadding:   3px;
          */
        }),
        variables = [
          {name: 'mypadding', value: '5px'}
        ],
        result = multiline(function() {
          /*

    @mycolor: #00ff00;

  @mypadding:   5px;
          */
        }),
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });
      it('should preserve comments', function() {
        var str = '' +
          '@mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '@mypadding: 3px;',
        variables = [
          {name: 'mypadding', value: '0'}
        ],
        result = '' +
          '@mycolor: #00ff00;\n' +
          '/* Comment */\n' +
          '@mypadding: 0;',
        changed = parser.setVariables(str, 'less', variables);
        expect(changed).eql(result);
      });
    });
  });

  describe('modifier variable finding', function() {
    it('should detect SCSS variables correctly', function() {
      var input = [
        {
          name: '$var1'
        },
        {
          name: '.modifier'
        },
        {
          name: '$var2'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql(['var1', 'var2']);
    });

    it('should detect LESS variables correctly', function() {
      var input = [
        {
          name: '@var1'
        },
        {
          name: '.modifier'
        },
        {
          name: '@var2'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql(['var1', 'var2']);
    });

    it('should return empty array when no variables are found', function() {
      var input = [
        {
          name: '.modifier'
        }
      ];
      expect(parser.findModifierVariables(input)).to.eql([]);
    });

    it('should return empty array with undefined input', function() {
      expect(parser.findModifierVariables()).to.eql([]);
    });
  });
});
