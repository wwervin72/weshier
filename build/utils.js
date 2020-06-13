const path = require('path')
const fs = require('fs-extra')

function getEntry (dir, {
	extname = '.js',
	deep = false,
	deepPath = ''
} = {}, res = Object.create(null)) {
	let files = fs.readdirSync(dir)
	files.forEach(file => {
		if (path.extname(file) === extname) {
			res[deepPath + path.basename(file, path.extname(file))] = path.join(dir, file)
		} else {
			if (deep) {
				let filePath = path.join(dir, file)
				if(fs.statSync(filePath).isDirectory()) {
					getEntry(filePath, {
						deep,
						extname,
						deepPath: `${file}/`
					}, res)
				}
			}
		}
	})
}

exports.getEntry  = getEntry
