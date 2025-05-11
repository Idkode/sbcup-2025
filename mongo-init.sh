#!/bin/sh
# set -e

/root/run.sh mongod --bind_ip 0.0.0.0 &
MONGO_PID=$!

sleep 5

echo "Waiting for MongoDB to be ready..."
until nc -z localhost 27017; do
  sleep 1
done

echo "Checking if backend user exists..."
echo "$MONGO_INITDB_DATABASE"
user_exists=$(mongo --quiet $MONGO_INITDB_DATABASE --eval "print(db.getUsers({filter: {user: '${MONGO_BACKEND_USERNAME}'}}).length)")

if [ "$user_exists" -eq "0" ]; then
  echo "Backend user does not exist. Creating..."
  mongo "${MONGO_INITDB_DATABASE}" --eval "
      db.createUser({
      user: '${MONGO_BACKEND_USERNAME}',
      pwd: '${MONGO_BACKEND_PASSWORD}',
      roles: [ { role: 'readWrite', db: '${MONGO_INITDB_DATABASE}' } ]
    });
    print('Backend user created successfully!');
  "
  if [ $? -ne 0 ]; then
    echo "Error creating user. Exiting."
    exit 1
  fi
else
  echo "Backend user already exists. Skipping creation."
fi

wait "$MONGO_PID"