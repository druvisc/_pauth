# _pauth

Suggestions:


Not really? Looks like just nodes print out?
If you're writing the policies through JavaScript, always use either double quote (") or
template literal/backtick (`) for strings to avoid escape symbols (\).

Bad
JS: '$resource.author === "Jimmy"'
JSON: "$resource.author === \"Jimmy\""

Good
JS: "$resource.author === 'Jimmy'"
JSON: "$resource.author === 'Jimmy'"



How does it compare to other XACML implementations?
IBM JavaScript PIP + Rest URL

How does it compare to the XACML standard?
Instead of AttributeDesignator and AttributeSelector to reference attributes, you access them through
JSONPath expressions, as if you were using XPAth in AttributeSelector, but also targeting an id
like for AttributeDesignator.




'($.subject.parent.email).includes("med.example.com")'

$. - start of a JSONPath query, where '$' indicates the authorization request context
( ) - since it's possible to retrieve nested attributes,
the parentheses allow to identify the start and the end of the attribute query


### Target

* Target everything
`
target: []
`

* Target a specific resource
`
target: '($.resource.id) == "/products/shoes"'
`