package utils

import (
	"fmt"
	"io"
	"os"
)

func OpenFile(filename string) ([]byte, error) {
	file, err := os.Open(filename)

	if err != nil {
		err = fmt.Errorf("error opening file: %v", err)
		return nil, err
	}

	defer file.Close()

	data, err := io.ReadAll(file)

	if err != nil {
		err = fmt.Errorf("error reading file: %v", err)
		return nil, err
	}

	return data, nil
}
